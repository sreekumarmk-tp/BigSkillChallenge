import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid

from app import models
from app.core.config import settings

def test_quiz_flow(client: TestClient, db: Session, normal_user_token_headers, test_user: models.User):
    # 1. Setup Competition and Questions
    comp = models.Competition(
        title="Quiz Comp",
        description="Test Quiz",
        entry_fee=5.0
    )
    db.add(comp)
    
    questions = []
    for i in range(10):
        q = models.Question(
            text=f"Question {i}",
            option_a="A", option_b="B", option_c="C", option_d="D",
            correct_answer="A"
        )
        db.add(q)
        questions.append(q)
    db.commit()
    db.refresh(comp)

    # 2. Try to start quiz without payment -> Should fail (402)
    response = client.post(
        f"{settings.API_V1_STR}/quiz/start",
        headers=normal_user_token_headers,
        json={"competition_id": str(comp.id)}
    )
    assert response.status_code == 402

    # 3. Add payment
    payment = models.Payment(
        user_id=str(test_user.id),
        competition_id=str(comp.id),
        amount=5.0,
        status="completed"
    )
    db.add(payment)
    db.commit()

    # 4. Start quiz -> Should succeed
    response = client.post(
        f"{settings.API_V1_STR}/quiz/start",
        headers=normal_user_token_headers,
        json={"competition_id": str(comp.id)}
    )
    assert response.status_code == 200, f"Start failed: {response.text}"
    data = response.json()
    attempt_id = data["attempt_id"]
    assert len(data["questions"]) == 5
    assert data["attempt_number"] == 1

    # 5. Evaluate answers (all correct)
    for q in data["questions"]:
        eval_resp = client.post(
            f"{settings.API_V1_STR}/quiz/evaluate-answer",
            headers=normal_user_token_headers,
            json={
                "attempt_id": attempt_id,
                "question_id": q["id"],
                "answer": "A"
            }
        )
        assert eval_resp.status_code == 200
        assert eval_resp.json()["is_correct"] is True

    # 6. Submit quiz -> Should pass
    submit_resp = client.post(
        f"{settings.API_V1_STR}/quiz/submit",
        headers=normal_user_token_headers,
        json={"attempt_id": attempt_id, "answers": []}
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "passed"

def test_quiz_failed_attempt(client: TestClient, db: Session, normal_user_token_headers, test_user: models.User):
    # Setup
    comp = models.Competition(id=str(uuid.uuid4()), title="Fail Comp", description="...", entry_fee=1.0)
    db.add(comp)
    for i in range(5):
        q = models.Question(text=f"Q{i}?", option_a="A", option_b="B", option_c="C", option_d="D", correct_answer="A")
        db.add(q)
    payment = models.Payment(user_id=str(test_user.id), competition_id=comp.id, amount=1.0, status="completed")
    db.add(payment)
    db.commit()

    # Start
    start_resp = client.post(
        f"{settings.API_V1_STR}/quiz/start",
        headers=normal_user_token_headers,
        json={"competition_id": comp.id}
    )
    assert start_resp.status_code == 200, start_resp.text
    data = start_resp.json()
    attempt_id = data["attempt_id"]
    question_id = data["questions"][0]["id"]

    # Wrong answer
    eval_resp = client.post(
        f"{settings.API_V1_STR}/quiz/evaluate-answer",
        headers=normal_user_token_headers,
        json={
            "attempt_id": attempt_id,
            "question_id": question_id,
            "answer": "B" # Wrong
        }
    )
    assert eval_resp.json()["is_correct"] is False

    # Submit -> Should be failed
    submit_resp = client.post(
        f"{settings.API_V1_STR}/quiz/submit",
        headers=normal_user_token_headers,
        json={"attempt_id": attempt_id, "answers": []}
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "failed"

def test_max_attempts(client: TestClient, db: Session, normal_user_token_headers, test_user: models.User):
    comp = models.Competition(id=str(uuid.uuid4()), title="Max Comp", description="...", entry_fee=1.0)
    db.add(comp)
    # Create 10 failed attempts
    for i in range(10):
        attempt = models.QuizAttempt(
            user_id=str(test_user.id),
            competition_id=comp.id,
            attempt_number=i+1,
            status="failed"
        )
        db.add(attempt)
    db.commit()

    # Try to start 11th
    response = client.post(
        f"{settings.API_V1_STR}/quiz/start",
        headers=normal_user_token_headers,
        json={"competition_id": comp.id}
    )
    assert response.status_code == 400
    assert "Maximum 10 attempts reached" in response.json()["detail"]
