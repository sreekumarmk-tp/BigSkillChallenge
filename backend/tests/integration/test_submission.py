import pytest
import uuid
from app import models
import traceback

@pytest.fixture
def auth_header(client, db):
    try:
        email = f"user_{uuid.uuid4()}@example.com"
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "first_name": "Test",
                "last_name": "User",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        
        # Activate user in DB
        user = db.query(models.User).filter(models.User.email == email).first()
        user.is_active = True
        db.add(user)
        db.commit()
        
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    except Exception as e:
        with open("/mnt/data/sreekumar/projects/AgenticAI/BigSkillChallenge/backend/scratch/test_fail.txt", "w") as f:
            f.write(f"Auth Header Error: {str(e)}\n{traceback.format_exc()}")
        raise e

def test_submit_entry(client, auth_header, mock_ai_adapter):
    try:
        # 1. Create competition
        comp_response = client.post(
            "/api/v1/competitions/",
            json={
                "title": "Test Competition",
                "description": "Test Description",
                "entry_fee": 10.0
            }
        )
        assert comp_response.status_code == 200
        competition_id = comp_response.json()["id"]

        # 2. Submit entry
        content = " ".join(["word"] * 25)
        
        response = client.post(
            "/api/v1/submissions/",
            headers=auth_header,
            json={
                "competition_id": competition_id,
                "content": content
            }
        )
        
        if response.status_code != 200:
             with open("/mnt/data/sreekumar/projects/AgenticAI/BigSkillChallenge/backend/scratch/test_fail.txt", "w") as f:
                f.write(f"Submission failed: {response.status_code} - {response.text}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == content
        assert "score" in data
        assert data["score"]["total_score"] == 32.5
    except Exception as e:
        with open("/mnt/data/sreekumar/projects/AgenticAI/BigSkillChallenge/backend/scratch/test_fail.txt", "a") as f:
            f.write(f"Test Entry Error: {str(e)}\n{traceback.format_exc()}")
        raise e
