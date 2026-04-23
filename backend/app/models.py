import uuid
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    otp = Column(String(6), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    payments = relationship("Payment", back_populates="user")
    entries = relationship("Entry", back_populates="user")
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class Competition(Base):
    __tablename__ = "competitions"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(100))
    description = Column(Text)
    entry_fee = Column(Float)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    payments = relationship("Payment", back_populates="competition")
    entries = relationship("Entry", back_populates="competition")
    
    def __str__(self):
        return self.title

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    competition_id = Column(String(36), ForeignKey("competitions.id"))
    amount = Column(Float)
    transaction_id = Column(String(100), unique=True, nullable=True)
    status = Column(String(20), default="pending") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="payments")
    competition = relationship("Competition", back_populates="payments")
    
    def __str__(self):
        return f"Payment of ${self.amount} ({self.status})"

class Entry(Base):
    __tablename__ = "entries"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    competition_id = Column(String(36), ForeignKey("competitions.id"))
    content = Column(Text) # The 25 word response
    status = Column(String(20), default="submitted") # submitted, scored
    is_winner = Column(Boolean, default=False)
    is_shortlisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="entries")
    competition = relationship("Competition", back_populates="entries")
    score = relationship("Score", back_populates="entry", uselist=False)
    
    def __str__(self):
        return f"Entry {self.id} by {self.user.email if self.user else 'Unknown'}"

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    entry_id = Column(String(36), ForeignKey("entries.id"))
    relevance_score = Column(Float)
    creativity_score = Column(Float)
    clarity_score = Column(Float)
    impact_score = Column(Float)
    total_score = Column(Float)
    feedback = Column(Text)
    
    entry = relationship("Entry", back_populates="score")
    
    def __str__(self):
        return f"Score: {self.total_score}"

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    text = Column(String(500))
    option_a = Column(String(200))
    option_b = Column(String(200))
    option_c = Column(String(200))
    option_d = Column(String(200))
    correct_answer = Column(String(1)) # A, B, C, or D
    
    def __str__(self):
        return self.text[:50] + "..." if len(self.text) > 50 else self.text

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    competition_id = Column(String(36), ForeignKey("competitions.id"))
    attempt_number = Column(Integer)
    status = Column(String(20), default="pending") # pending, passed, failed
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    competition = relationship("Competition")
    
    def __str__(self):
        return f"Attempt {self.attempt_number} ({self.status}) - Score: {self.score}"
