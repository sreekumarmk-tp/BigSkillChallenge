from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.services.ai_adapter import evaluate_entry

router = APIRouter()

@router.post("/", response_model=schemas.EntryResponse)
def create_submission(
    *,
    db: Session = Depends(deps.get_db),
    entry_in: schemas.EntryCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    # Validate exactly 25 words
    words = entry_in.content.split()
    if len(words) != 25:
        raise HTTPException(
            status_code=400,
            detail=f"Entry must be exactly 25 words. You provided {len(words)} words."
        )
    
    # Create the entry
    entry = models.Entry(
        user_id=current_user.id,
        competition_id=entry_in.competition_id,
        content=entry_in.content,
        status="scored"
    )
    db.add(entry)
    db.flush() # flush to get the entry.id
    
    # Run AI evaluation (mocked deterministic scoring)
    scoring_result = evaluate_entry(entry_in.content)
    
    # Store score
    score = models.Score(
        entry_id=entry.id,
        relevance_score=scoring_result.relevance_score,
        creativity_score=scoring_result.creativity_score,
        clarity_score=scoring_result.clarity_score,
        impact_score=scoring_result.impact_score,
        total_score=scoring_result.total_score,
        feedback=scoring_result.feedback
    )
    
    db.add(score)
    db.commit()
    db.refresh(entry)
    return entry
