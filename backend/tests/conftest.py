import pytest
from unittest.mock import MagicMock
import os
import sys

# Add backend to path if not already there
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Mock ensure_db_running
import app.core.db_setup
app.core.db_setup.ensure_db_running = MagicMock()

# 2. Set DATABASE_URL env var to use SQLite before app.main imports anything
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# 3. Create the test engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 4. Patch the engine in app.database BEFORE it's imported by app.main
import app.database
app.database.engine = test_engine
app.database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

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
