from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Competition Schemas ---
class CompetitionBase(BaseModel):
    title: str
    description: str
    entry_fee: float

class CompetitionCreate(CompetitionBase):
    pass

class CompetitionResponse(CompetitionBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    competition_id: int
    amount: float
    # In a real system, would include a payment method token

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    competition_id: int
    amount: float
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Entry Schemas ---
class EntryCreate(BaseModel):
    competition_id: int
    content: str
    
class ScoreResponse(BaseModel):
    relevance_score: float
    creativity_score: float
    clarity_score: float
    impact_score: float
    total_score: float
    feedback: str
    
    class Config:
        from_attributes = True

class EntryResponse(BaseModel):
    id: int
    user_id: int
    competition_id: int
    content: str
    status: str
    created_at: datetime
    score: Optional[ScoreResponse] = None
    
    class Config:
        from_attributes = True
