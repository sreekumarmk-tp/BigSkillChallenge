import pytest
from unittest.mock import MagicMock
import os
import sys

# Add backend to path if not already there
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Force TESTING environment and completely neutralize limiter early
os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "testing" # Prevent forcing mock mode in payment.py
os.environ["STRIPE_SECRET_KEY"] = "sk_test_fake" # Ensure _get_stripe returns stripe module

import slowapi
# Neutralize the limit decorator before any router uses it
slowapi.Limiter.limit = lambda *args, **kwargs: (lambda f: f)

# Neutralize the middleware dispatch to prevent 429 even if it's accidentally added
from slowapi.middleware import SlowAPIMiddleware
SlowAPIMiddleware.dispatch = lambda self, request, call_next: call_next(request)

import app.core.limiter
app.core.limiter.limiter.enabled = False

# 2. Mock ensure_db_running
import app.core.db_setup
app.core.db_setup.ensure_db_running = MagicMock()

# 3. Set DATABASE_URL env var to use SQLite before app.main imports anything
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# 4. Create the test engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 5. Patch the engine and session factory in app.database
import app.database
app.database.engine = test_engine
app.database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine, expire_on_commit=False)

from app.main import app
from app.database import Base, get_db
from app.core.security import create_access_token
from app.models import User

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine, expire_on_commit=False)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def db():
    session = TestingSessionLocal()
    yield session
    session.close()
    
    # Cleanup data after each test
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db: Session) -> User:
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        first_name="Test",
        last_name="User",
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_superuser(db: Session) -> User:
    user = User(
        email="admin@example.com",
        hashed_password="hashed_password",
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def normal_user_token_headers(test_user: User) -> dict:
    access_token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def superuser_token_headers(test_superuser: User) -> dict:
    access_token = create_access_token(subject=str(test_superuser.id))
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def mock_ai_adapter(mocker):
    from app import schemas
    mock = mocker.patch("app.api.submission.evaluate_entry", new_callable=mocker.AsyncMock)
    mock.return_value = schemas.ScoreResponse(
        relevance_score=8.5,
        creativity_score=7.0,
        clarity_score=9.0,
        impact_score=8.0,
        total_score=32.5,
        feedback="Great response!"
    )
    return mock
