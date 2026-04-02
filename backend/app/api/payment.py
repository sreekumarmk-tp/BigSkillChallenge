from typing import Any
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.PaymentResponse)
async def process_mock_payment(
    *,
    db: Session = Depends(deps.get_db),
    payment_in: schemas.PaymentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Process a mock payment. In a real application, this would integrate
    with Stripe or Razorpay APIs to confirm the transaction.
    """
    import asyncio
    await asyncio.sleep(1.5) # Simulate processing delay
    
    comp = db.query(models.Competition).filter(models.Competition.id == payment_in.competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
        
    payment = models.Payment(
        user_id=current_user.id,
        competition_id=payment_in.competition_id,
        amount=payment_in.amount,
        status="completed", # Mocking successful payment
        transaction_id=str(uuid.uuid4())
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
