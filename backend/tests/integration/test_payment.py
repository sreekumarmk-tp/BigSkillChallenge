import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid
import os
from unittest.mock import MagicMock

from app import models
from app.core.config import settings

@pytest.fixture
def test_competition(db: Session) -> models.Competition:
    comp = models.Competition(
        id=str(uuid.uuid4()),
        title="Test Comp",
        description="Desc",
        entry_fee=10.0,
        is_active=True
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

def test_create_payment_intent_mock(client: TestClient, db: Session, test_user, test_competition, normal_user_token_headers):
    # Mock stripe.PaymentIntent.create
    import stripe
    mock_intent = {
        "id": "pi_test_123",
        "client_secret": "secret_123"
    }
    stripe.PaymentIntent.create = MagicMock(return_value=mock_intent)

    response = client.post(
        f"{settings.API_V1_STR}/payments/intent",
        headers=normal_user_token_headers,
        json={"competition_id": str(test_competition.id), "amount": 10.0}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["client_secret"] == "secret_123"

    # Verify payment record was created in DB
    payment = db.query(models.Payment).filter(models.Payment.stripe_payment_intent_id == "pi_test_123").first()
    assert payment is not None
    assert payment.status == "pending"

def test_get_my_payments(client: TestClient, db: Session, test_user, normal_user_token_headers):
    # Create some payments manually
    p1 = models.Payment(
        id=str(uuid.uuid4()),
        user_id=str(test_user.id),
        competition_id=str(uuid.uuid4()),
        amount=10.0,
        status="completed"
    )
    p2 = models.Payment(
        id=str(uuid.uuid4()),
        user_id=str(test_user.id),
        competition_id=str(uuid.uuid4()),
        amount=20.0,
        status="failed"
    )
    db.add(p1)
    db.add(p2)
    db.commit()

    response = client.get(
        f"{settings.API_V1_STR}/payments/me",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    statuses = [p["status"] for p in data]
    assert "completed" in statuses
    assert "failed" in statuses

def test_refund_payment_admin(client: TestClient, db: Session, test_superuser, superuser_token_headers):
    # Create a completed payment
    payment = models.Payment(
        id=str(uuid.uuid4()),
        user_id=str(test_superuser.id),
        competition_id=str(uuid.uuid4()),
        amount=15.0,
        status="completed",
        stripe_payment_intent_id="pi_to_refund"
    )
    db.add(payment)
    db.commit()

    # Mock stripe.Refund.create
    import stripe
    mock_refund = {"id": "re_123"}
    stripe.Refund.create = MagicMock(return_value=mock_refund)

    response = client.post(
        f"{settings.API_V1_STR}/payments/{payment.id}/refund",
        headers=superuser_token_headers
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "refunded"
    
    db.refresh(payment)
    assert payment.status == "refunded"
    assert payment.refund_id == "re_123"

def test_refund_payment_non_admin(client: TestClient, db: Session, test_user, normal_user_token_headers):
    payment = models.Payment(
        id=str(uuid.uuid4()),
        user_id=str(test_user.id),
        competition_id=str(uuid.uuid4()),
        amount=15.0,
        status="completed"
    )
    db.add(payment)
    db.commit()

    response = client.post(
        f"{settings.API_V1_STR}/payments/{payment.id}/refund",
        headers=normal_user_token_headers
    )
    assert response.status_code in [400, 403], response.text

def test_stripe_webhook_mock(client: TestClient, db: Session):
    # Create a pending payment
    payment = models.Payment(
        id=str(uuid.uuid4()),
        user_id=str(uuid.uuid4()),
        competition_id=str(uuid.uuid4()),
        amount=10.0,
        status="pending",
        stripe_payment_intent_id="pi_webhook"
    )
    db.add(payment)
    db.commit()

    # Mock stripe.Webhook.construct_event
    import stripe
    stripe.Webhook.construct_event = MagicMock(return_value={
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_webhook"
            }
        }
    })

    # Set webhook secret to prevent 400
    os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test"
    from app.core.config import settings as app_settings
    app_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

    response = client.post(
        f"{settings.API_V1_STR}/payments/webhook",
        headers={"Stripe-Signature": "mock_sig"},
        content="mock_body"
    )
    assert response.status_code == 200
    
    db.refresh(payment)
    assert payment.status == "completed"
