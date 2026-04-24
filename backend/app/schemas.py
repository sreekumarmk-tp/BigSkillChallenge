from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[UUID] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Competition Schemas ---
class CompetitionBase(BaseModel):
    title: str
    description: str
    entry_fee: float
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CompetitionCreate(CompetitionBase):
    pass

class CompetitionResponse(CompetitionBase):
    id: UUID
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    competition_id: UUID
    amount: float

# P0: Client creates a PaymentIntent via this request.
class PaymentIntentCreate(BaseModel):
    competition_id: UUID
    amount: float

# P0: Returned to the mobile client after PaymentIntent creation.
class PaymentIntentResponse(BaseModel):
    payment_record_id: UUID          # Our internal Payment.id
    client_secret: str               # Stripe client_secret — used by the mobile SDK
    publishable_key: str             # Stripe publishable key for the mobile SDK
    amount: float
    currency: str = "usd"

class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    competition_id: UUID
    amount: float
    status: str
    transaction_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    refund_id: Optional[str] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# P0: Response after an admin-initiated refund
class PaymentRefundResponse(BaseModel):
    payment_id: UUID
    refund_id: str
    status: str
    refunded_at: datetime

    class Config:
        from_attributes = True

# --- Entry Schemas ---
class EntryCreate(BaseModel):
    competition_id: UUID
    content: str
    # P2: Optional device fingerprint sent by the mobile app for anti-cheat audit
    device_id: Optional[str] = None
    
class ScoreResponse(BaseModel):
    relevance_score: float
    creativity_score: float
    clarity_score: float
    impact_score: float
    total_score: float
    feedback: str
    # P2: Prompt version used when scoring — allows re-scoring audit
    prompt_version: Optional[str] = None
    
    class Config:
        from_attributes = True

class EntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    competition_id: UUID
    content: str
    status: str
    is_shortlisted: bool
    is_winner: bool
    device_id: Optional[str] = None
    created_at: datetime
    score: Optional[ScoreResponse] = None
    
    class Config:
        from_attributes = True

class EntryPercentileResponse(BaseModel):
    entry_id: UUID
    competition_id: UUID
    total_entries: int
    rank: int
    top_percentage: float
    percentile: float

class AuditTrailEventResponse(BaseModel):
    event: str
    hash: str
    occurred_at: Optional[datetime] = None

class EntryAuditTrailResponse(BaseModel):
    entry_id: UUID
    events: List[AuditTrailEventResponse]

# --- Quiz Schemas ---
class QuestionResponse(BaseModel):
    id: UUID
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    
    class Config:
        from_attributes = True

class QuizAttemptBase(BaseModel):
    competition_id: UUID

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttemptResponse(QuizAttemptBase):
    id: UUID
    user_id: UUID
    attempt_number: int
    status: str
    score: int
    created_at: datetime
    passed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: UUID
    answer: str  # A, B, C, or D

class AnswerEvaluationRequest(BaseModel):
    attempt_id: UUID
    question_id: UUID
    answer: str

class QuizSubmission(BaseModel):
    attempt_id: UUID
    answers: List[AnswerSubmission]

class QuizStartResponse(BaseModel):
    attempt_id: UUID
    questions: List[QuestionResponse]
    attempt_number: int
    
    class Config:
        from_attributes = True
