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
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    
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
    is_shortlisted: bool
    is_winner: bool
    created_at: datetime
    score: Optional[ScoreResponse] = None
    
    class Config:
        from_attributes = True

class EntryPercentileResponse(BaseModel):
    entry_id: int
    competition_id: int
    total_entries: int
    rank: int
    top_percentage: float
    percentile: float

# --- Quiz Schemas ---
class QuestionResponse(BaseModel):
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    
    class Config:
        from_attributes = True

class QuizAttemptBase(BaseModel):
    competition_id: int

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttemptResponse(QuizAttemptBase):
    id: int
    user_id: int
    attempt_number: int
    status: str
    score: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    answer: str # A, B, C, or D

class AnswerEvaluationRequest(BaseModel):
    attempt_id: int
    question_id: int
    answer: str

class QuizSubmission(BaseModel):
    attempt_id: int
    answers: List[AnswerSubmission]

class QuizStartResponse(BaseModel):
    attempt_id: int
    questions: List[QuestionResponse]
    attempt_number: int
    
    class Config:
        from_attributes = True
