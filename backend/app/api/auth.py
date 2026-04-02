import secrets
import string
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.services import email as email_service

router = APIRouter()

def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP."""
    digits = string.digits
    return ''.join(secrets.choice(digits) for i in range(length))

@router.post("/register", response_model=schemas.UserResponse)
async def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this user email already exists in the system.",
        )
    
    otp = generate_otp()
    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        otp=otp,
        is_active=False # Setting inactive until verified
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send simulated verification email
    await email_service.send_verification_email(user.email, otp)
    
    # Generate token for immediate session
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    
    # We return the user object but we need to inject the token properties
    # Since our response_model is schemas.UserResponse, we convert to dict and add tokens
    user_data = schemas.UserResponse.model_validate(user).model_dump()
    user_data.update({
        "access_token": access_token,
        "token_type": "bearer"
    })
    
    return user_data

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Check if user is active (fully verified)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User email not verified")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

class VerifyEmailRequest(schemas.BaseModel):
    otp: str

@router.post("/verify-email")
def verify_email(
    request: VerifyEmailRequest,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Verify user email using OTP.
    """
    if not current_user.otp:
         # If otp is null, they might already be verified
         if current_user.is_active:
             return {"message": "Email already verified."}
         raise HTTPException(status_code=400, detail="No verification pending.")
    
    if request.otp != current_user.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    
    # Clear the OTP and activate after successful verification
    current_user.otp = None
    current_user.is_active = True
    db.add(current_user)
    db.commit()
    
    return {"message": "Email verified successfully."}
