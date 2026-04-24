from typing import Any, List
from datetime import datetime, timezone
from hashlib import sha256
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps
from app.core.config import settings
from app.core.limiter import limiter
from app.services.ai_adapter import evaluate_entry

router = APIRouter()


def _build_audit_hash(entry_id: str, event: str, marker: str) -> str:
    digest = sha256(f"{entry_id}:{event}:{marker}".encode("utf-8")).hexdigest()
    return digest[:12]


async def _score_and_save(entry_id: str, content: str, db_session_factory) -> None:
    """P1: Background task — decouples LLM scoring from the HTTP response.
    Runs after the HTTP 201 is already returned to the client.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        scoring_result = await evaluate_entry(content)
        entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
        if not entry:
            return
        score = models.Score(
            entry_id=entry_id,
            relevance_score=scoring_result.relevance_score,
            creativity_score=scoring_result.creativity_score,
            clarity_score=scoring_result.clarity_score,
            impact_score=scoring_result.impact_score,
            total_score=scoring_result.total_score,
            feedback=scoring_result.feedback,
            prompt_version=scoring_result.prompt_version,
        )
        db.add(score)
        entry.status = "scored"
        db.commit()
    except Exception as exc:
        # Log but do not crash — entry stays in "submitted" state and can be re-scored.
        import logging
        logging.getLogger(__name__).error(f"Background scoring failed for {entry_id}: {exc}")
    finally:
        db.close()


@router.get("/me", response_model=List[schemas.EntryResponse])
def get_my_submissions(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    entries = db.query(models.Entry).filter(models.Entry.user_id == current_user.id).all()
    return entries


@router.get("/{entry_id}/percentile", response_model=schemas.EntryPercentileResponse)
def get_entry_percentile(
    *,
    db: Session = Depends(deps.get_db),
    entry_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    if not entry.score:
        raise HTTPException(status_code=400, detail="Entry is not scored yet")

    total_entries = db.query(func.count(models.Score.id)).join(
        models.Entry, models.Score.entry_id == models.Entry.id
    ).filter(
        models.Entry.competition_id == entry.competition_id
    ).scalar() or 0

    if total_entries == 0:
        raise HTTPException(status_code=404, detail="No scored entries found for this competition")

    higher_scores = db.query(func.count(models.Score.id)).join(
        models.Entry, models.Score.entry_id == models.Entry.id
    ).filter(
        models.Entry.competition_id == entry.competition_id,
        models.Score.total_score > entry.score.total_score
    ).scalar() or 0

    rank = higher_scores + 1
    top_percentage = round((rank / total_entries) * 100, 2)
    percentile = round(((total_entries - rank) / total_entries) * 100, 2)

    return {
        "entry_id": entry.id,
        "competition_id": entry.competition_id,
        "total_entries": total_entries,
        "rank": rank,
        "top_percentage": top_percentage,
        "percentile": percentile,
    }


@router.get("/{entry_id}/audit-trail", response_model=schemas.EntryAuditTrailResponse)
def get_entry_audit_trail(
    *,
    db: Session = Depends(deps.get_db),
    entry_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    submitted_at = entry.created_at
    scored_at = entry.score is not None
    shortlist_generated = entry.is_shortlisted or entry.status == "shortlisted"

    timeline: List[dict[str, Any]] = [
        {
            "event": "Entry submitted and sealed",
            "occurred_at": submitted_at,
            "hash": _build_audit_hash(
                entry.id,
                "Entry submitted and sealed",
                submitted_at.isoformat() if isinstance(submitted_at, datetime) else "submitted",
            ),
        }
    ]

    if scored_at:
        timeline.append(
            {
                "event": "AI evaluation completed",
                "occurred_at": submitted_at,
                "hash": _build_audit_hash(entry.id, "AI evaluation completed", "scored"),
            }
        )

    if shortlist_generated:
        timeline.append(
            {
                "event": "Shortlist generated",
                "occurred_at": submitted_at,
                "hash": _build_audit_hash(entry.id, "Shortlist generated", "shortlisted"),
            }
        )

    return {
        "entry_id": entry.id,
        "events": timeline,
    }


@router.post("/", response_model=schemas.EntryResponse, status_code=201)
@limiter.limit("5/minute")  # P1: Anti-abuse — max 5 submission attempts per minute per user
async def create_submission(
    *,
    request: Request,  # Required by slowapi
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    entry_in: schemas.EntryCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    x_device_id: str = Header(default=None, alias="X-Device-Id"),
) -> Any:
    # -----------------------------------------------------------------------
    # P0: Enforce maximum 10 entries per participant per competition.
    # -----------------------------------------------------------------------
    existing_count = db.query(func.count(models.Entry.id)).filter(
        models.Entry.user_id == str(current_user.id),
        models.Entry.competition_id == str(entry_in.competition_id),
    ).scalar() or 0

    if existing_count >= settings.MAX_ENTRIES_PER_USER:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_ENTRIES_PER_USER} entries per participant reached.",
        )

    # -----------------------------------------------------------------------
    # P1: Submission time-window — must submit within SUBMISSION_WINDOW_MINUTES
    # of a passed quiz attempt (0 = disabled).
    # -----------------------------------------------------------------------
    if settings.SUBMISSION_WINDOW_MINUTES > 0:
        latest_pass = (
            db.query(models.QuizAttempt)
            .filter(
                models.QuizAttempt.user_id == str(current_user.id),
                models.QuizAttempt.competition_id == str(entry_in.competition_id),
                models.QuizAttempt.status == "passed",
            )
            .order_by(models.QuizAttempt.passed_at.desc().nullslast())
            .first()
        )

        if not latest_pass:
            raise HTTPException(
                status_code=403,
                detail="You must pass the eligibility quiz before submitting an entry.",
            )

        # If passed_at is None (legacy record), skip the window check gracefully.
        if latest_pass.passed_at is not None:
            now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
            elapsed = (now_utc - latest_pass.passed_at).total_seconds() / 60
            if elapsed > settings.SUBMISSION_WINDOW_MINUTES:
                raise HTTPException(
                    status_code=403,
                    detail=(
                        f"Submission window expired. You must submit within "
                        f"{settings.SUBMISSION_WINDOW_MINUTES} minutes of passing the quiz."
                    ),
                )

    # -----------------------------------------------------------------------
    # Validate exactly 25 words.
    # -----------------------------------------------------------------------
    words = entry_in.content.split()
    if len(words) != 25:
        raise HTTPException(
            status_code=400,
            detail=f"Entry must be exactly 25 words. You provided {len(words)} words.",
        )

    # -----------------------------------------------------------------------
    # Persist the entry immediately so the client gets a 201 fast.
    # P1: AI scoring is dispatched as a background task.
    # -----------------------------------------------------------------------
    device_id = entry_in.device_id or x_device_id
    entry = models.Entry(
        user_id=str(current_user.id),
        competition_id=str(entry_in.competition_id),
        content=entry_in.content,
        status="submitted",
        device_id=device_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Fire-and-forget scoring in a background task.
    background_tasks.add_task(_score_and_save, entry.id, entry_in.content, None)

    return entry
