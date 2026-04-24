from pydantic import BaseModel
from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app import models, schemas
from app.api import deps

router = APIRouter()

def check_attempt_eligibility(db: Session, user_id: UUID, competition_id: UUID):
    user_id_str = str(user_id)
    competition_id_str = str(competition_id)
    # 1. Check 10-attempt limit
    attempts_count = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == user_id_str,
        models.QuizAttempt.competition_id == competition_id_str
    ).count()
    
    if attempts_count >= 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 attempts reached"
        )
        
    # 2. Check for unused payment
    payments_count = db.query(models.Payment).filter(
        models.Payment.user_id == user_id_str,
        models.Payment.competition_id == competition_id_str,
        models.Payment.status == "completed"
    ).count()
    
    finished_attempts_count = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == user_id_str,
        models.QuizAttempt.competition_id == competition_id_str,
        models.QuizAttempt.status.in_(["passed", "failed"])
    ).count()
    
    if payments_count <= finished_attempts_count:
        raise HTTPException(
            status_code=402,
            detail="Payment required for new attempt. Please pay to try again."
        )
    
    return attempts_count

@router.get("/questions", response_model=List[schemas.QuestionResponse])
def get_quiz_questions(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    competition_id: UUID,
) -> Any:
    competition_id_str = str(competition_id)
    # Check eligibility (10-attempt limit and payment)
    attempts_count = check_attempt_eligibility(db, current_user.id, competition_id)
    
    # Pick random 5 questions
    questions = db.query(models.Question).order_by(func.random()).limit(5).all()
    
    # Create new attempt record
    attempt = models.QuizAttempt(
        user_id=str(current_user.id),
        competition_id=competition_id_str,
        attempt_number=attempts_count + 1,
        status="pending"
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Return questions and we include the attempt_id in the response headers or as first element?
    # Let's change schema or return a wrapper.
    # Actually, let's just make a start endpoint that returns attempt info + questions.
    return questions

@router.post("/start", response_model=schemas.QuizStartResponse)
def start_quiz(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    attempt_in: schemas.QuizAttemptCreate,
) -> Any:
    competition_id_str = str(attempt_in.competition_id)
    # If there is an unfinished pending attempt, treat it as timed out.
    # This ensures timed-out attempts are recorded as failed and consume an attempt.
    pending_attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.competition_id == competition_id_str,
        models.QuizAttempt.status == "pending"
    ).first()
    
    if pending_attempt:
        pending_attempt.status = "failed"
        db.commit()
    
    # Check eligibility (10-attempt limit and payment)
    attempts_count = check_attempt_eligibility(db, current_user.id, attempt_in.competition_id)
    
    # Create new attempt record
    attempt = models.QuizAttempt(
        user_id=str(current_user.id),
        competition_id=competition_id_str,
        attempt_number=attempts_count + 1,
        status="pending"
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Pick random 5 questions
    questions = db.query(models.Question).order_by(func.random()).limit(5).all()
    
    return {
        "attempt_id": attempt.id,
        "questions": questions,
        "attempt_number": attempt.attempt_number
    }

@router.post("/evaluate-answer", response_model=dict)
def evaluate_answer(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    eval_in: schemas.AnswerEvaluationRequest, # Fixed schema
) -> Any:
    attempt_id_str = str(eval_in.attempt_id)
    question_id_str = str(eval_in.question_id)
    attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.id == attempt_id_str,
        models.QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.status != "pending":
         raise HTTPException(status_code=400, detail="Attempt already completed")
    
    q = db.query(models.Question).filter(models.Question.id == question_id_str).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = q.correct_answer == eval_in.answer
    if is_correct:
        attempt.score += 1
        db.commit()
        return {"is_correct": True}
    else:
        attempt.status = "failed"
        db.commit()
        return {"is_correct": False}

@router.post("/submit", response_model=schemas.QuizAttemptResponse)
def submit_quiz(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    submission: schemas.QuizSubmission,
) -> Any:
    attempt_id_str = str(submission.attempt_id)
    attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.id == attempt_id_str,
        models.QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.status == "failed":
         return attempt

    # Final check: did they answer all 5 and were they all correct?
    if attempt.score == 5:
        attempt.status = "passed"
        # P1: Record the exact time the quiz was passed — used by submission time-window.
        from datetime import datetime, timezone
        attempt.passed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        attempt.status = "failed"
        
    db.commit()
    db.refresh(attempt)
    return attempt

@router.get("/attempts/{competition_id}", response_model=List[schemas.QuizAttemptResponse])
def get_user_attempts(
    competition_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    competition_id_str = str(competition_id)
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.competition_id == competition_id_str
    ).all()
    return attempts

@router.get("/attempts-all/me", response_model=List[schemas.QuizAttemptResponse])
def get_my_all_attempts(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id
    ).order_by(models.QuizAttempt.created_at.desc()).all()
    return attempts
