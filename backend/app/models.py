import uuid
from sqlalchemy import (
    Column, Index, Integer, String, Float, ForeignKey,
    DateTime, Boolean, Text
)
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
    # P0: Extended status set — pending | completed | failed | refunded | refund_pending
    status = Column(String(20), default="pending")
    # P0: Stripe PaymentIntent ID for server-side confirmation and refunds
    stripe_payment_intent_id = Column(String(100), nullable=True)
    # P0: Stripe refund ID returned after a successful refund call
    refund_id = Column(String(100), nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payments")
    competition = relationship("Competition", back_populates="payments")
    # Tracks which entry this payment enabled (nullable = not yet submitted)
    entry = relationship("Entry", back_populates="payment", uselist=False)

    def __str__(self):
        return f"Payment of ${self.amount} ({self.status})"


class Entry(Base):
    __tablename__ = "entries"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    competition_id = Column(String(36), ForeignKey("competitions.id"))
    # P0: FK back to the payment that authorised this entry (enables refund audit)
    payment_id = Column(String(36), ForeignKey("payments.id"), nullable=True)
    content = Column(Text)  # The 25-word response
    status = Column(String(20), default="submitted")  # submitted | scored
    is_winner = Column(Boolean, default=False)
    is_shortlisted = Column(Boolean, default=False)
    # P2: Device fingerprint collected from client for anti-cheat audit
    device_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="entries")
    competition = relationship("Competition", back_populates="entries")
    payment = relationship("Payment", back_populates="entry", foreign_keys=[payment_id])
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
    # P2: Prompt version — changes here mean re-scoring is needed for fairness
    prompt_version = Column(String(20), nullable=True)

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
    correct_answer = Column(String(1))  # A, B, C, or D

    def __str__(self):
        return self.text[:50] + "..." if len(self.text) > 50 else self.text


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    competition_id = Column(String(36), ForeignKey("competitions.id"))
    attempt_number = Column(Integer)
    status = Column(String(20), default="pending")  # pending | passed | failed
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    # P1: Recorded when quiz passes — used to enforce submission time-window
    passed_at = Column(DateTime, nullable=True)

    user = relationship("User")
    competition = relationship("Competition")

    def __str__(self):
        return f"Attempt {self.attempt_number} ({self.status}) - Score: {self.score}"


# ---------------------------------------------------------------------------
# P1: Composite indexes for the high-volume queries identified in the audit.
# ---------------------------------------------------------------------------

# Submission cap check: count entries per user per competition
Index("ix_entries_user_comp", Entry.user_id, Entry.competition_id)

# Percentile query: scoring rank lookup across competition
Index("ix_scores_total_score", Score.total_score)

# Payment eligibility check in quiz.py:check_attempt_eligibility
Index("ix_payments_user_comp_status", Payment.user_id, Payment.competition_id, Payment.status)

# Quiz attempt count per user per competition
Index("ix_quiz_attempts_user_comp", QuizAttempt.user_id, QuizAttempt.competition_id)
