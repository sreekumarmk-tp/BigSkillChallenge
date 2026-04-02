from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    otp = Column(String(6), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    payments = relationship("Payment", back_populates="user")
    entries = relationship("Entry", back_populates="user")

class Competition(Base):
    __tablename__ = "competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(Text)
    entry_fee = Column(Float)
    is_active = Column(Boolean, default=True)
    
    payments = relationship("Payment", back_populates="competition")
    entries = relationship("Entry", back_populates="competition")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    amount = Column(Float)
    transaction_id = Column(String(100), unique=True, nullable=True)
    status = Column(String(20), default="pending") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="payments")
    competition = relationship("Competition", back_populates="payments")

class Entry(Base):
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    content = Column(Text) # The 25 word response
    status = Column(String(20), default="submitted") # submitted, scored
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="entries")
    competition = relationship("Competition", back_populates="entries")
    score = relationship("Score", back_populates="entry", uselist=False)

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("entries.id"))
    relevance_score = Column(Float)
    creativity_score = Column(Float)
    clarity_score = Column(Float)
    impact_score = Column(Float)
    total_score = Column(Float)
    feedback = Column(Text)
    
    entry = relationship("Entry", back_populates="score")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(500))
    option_a = Column(String(200))
    option_b = Column(String(200))
    option_c = Column(String(200))
    option_d = Column(String(200))
    correct_answer = Column(String(1)) # A, B, C, or D

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    attempt_number = Column(Integer)
    status = Column(String(20), default="pending") # pending, passed, failed
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    competition = relationship("Competition")
