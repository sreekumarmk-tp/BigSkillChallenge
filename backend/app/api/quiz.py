from pydantic import BaseModel
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app import models, schemas
from app.api import deps

router = APIRouter()

def check_attempt_eligibility(db: Session, user_id: int, competition_id: int):
    # 1. Check 10-attempt limit
    attempts_count = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == user_id,
        models.QuizAttempt.competition_id == competition_id
    ).count()
    
    if attempts_count >= 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 attempts reached"
        )
        
    # 2. Check for unused payment
    payments_count = db.query(models.Payment).filter(
        models.Payment.user_id == user_id,
        models.Payment.competition_id == competition_id,
        models.Payment.status == "completed"
    ).count()
    
    finished_attempts_count = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == user_id,
        models.QuizAttempt.competition_id == competition_id,
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
    competition_id: int,
) -> Any:
    # Check eligibility (10-attempt limit and payment)
    attempts_count = check_attempt_eligibility(db, current_user.id, competition_id)
    
    # Pick random 5 questions
    questions = db.query(models.Question).order_by(func.random()).limit(5).all()
    
    # Create new attempt record
    attempt = models.QuizAttempt(
        user_id=current_user.id,
        competition_id=competition_id,
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
    # Check for an existing pending attempt
    pending_attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.competition_id == attempt_in.competition_id,
        models.QuizAttempt.status == "pending"
    ).first()
    
    if pending_attempt:
        attempt = pending_attempt
        attempt.score = 0
        db.commit()
        db.refresh(attempt)
    else:
        # Check eligibility (10-attempt limit and payment)
        attempts_count = check_attempt_eligibility(db, current_user.id, attempt_in.competition_id)
        
        # Create new attempt record
        attempt = models.QuizAttempt(
            user_id=current_user.id,
            competition_id=attempt_in.competition_id,
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
    attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.id == eval_in.attempt_id,
        models.QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.status != "pending":
         raise HTTPException(status_code=400, detail="Attempt already completed")
    
    q = db.query(models.Question).filter(models.Question.id == eval_in.question_id).first()
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
    attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.id == submission.attempt_id,
        models.QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.status == "failed":
         return attempt

    # Final check: did they answer all 5 and were they all correct?
    if attempt.score == 5:
        attempt.status = "passed"
    else:
        attempt.status = "failed"
        
    db.commit()
    db.refresh(attempt)
    return attempt

@router.get("/attempts/{competition_id}", response_model=List[schemas.QuizAttemptResponse])
def get_user_attempts(
    competition_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.competition_id == competition_id
    ).all()
    return attempts
