import pytest
from pydantic import ValidationError
from app.schemas import UserCreate, CompetitionCreate

def test_user_create_valid():
    user_data = {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "password123"
    }
    user = UserCreate(**user_data)
    assert user.email == "test@example.com"
    assert user.password == "password123"

def test_user_create_invalid_email():
    user_data = {
        "email": "invalid-email",
        "password": "password123"
    }
    with pytest.raises(ValidationError):
        UserCreate(**user_data)

def test_competition_create_valid():
    comp_data = {
        "title": "Test Competition",
        "description": "Test Description",
        "entry_fee": 10.0
    }
    comp = CompetitionCreate(**comp_data)
    assert comp.title == "Test Competition"
    assert comp.entry_fee == 10.0
