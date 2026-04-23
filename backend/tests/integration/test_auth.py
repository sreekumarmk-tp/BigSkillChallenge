import pytest
from app import models

def test_verify_and_login_user(client, db):
    # 1. Register
    email = "verify_login@example.com"
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "first_name": "Login",
            "last_name": "Test",
            "password": "password123"
        }
    )
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    token = reg_data["access_token"]
    
    # 2. Get OTP from DB
    user = db.query(models.User).filter(models.User.email == email).first()
    otp = user.otp
    
    # 3. Verify Email
    verify_response = client.post(
        "/api/v1/auth/verify-email",
        headers={"Authorization": f"Bearer {token}"},
        json={"otp": otp}
    )
    assert verify_response.status_code == 200
    
    # 4. Login
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "password123"
        }
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "integration@example.com",
            "first_name": "Integ",
            "last_name": "Test",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "integration@example.com"
    assert "id" in data
    assert "access_token" in data

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 400
