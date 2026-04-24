"""
payment.py — P0 implementation

Flow:
  1. POST /payments/intent   → Creates a Stripe PaymentIntent + pending Payment record.
                               Returns {client_secret, publishable_key} to the mobile SDK.
  2. Stripe mobile SDK       → Confirms the payment on-device (no raw card data touches our server).
  3. POST /payments/webhook  → Stripe calls this endpoint asynchronously with the outcome.
                               We mark Payment as completed/failed here.
  4. POST /payments/{id}/refund → Admin endpoint to issue a Stripe refund and set refunded status.

Fallback (mock mode):
  If STRIPE_SECRET_KEY is not configured, the old mock behaviour is preserved so the app
  still works in local development without a Stripe account.
"""

import logging
from typing import Any
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.config import settings
from app.core.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_stripe():
    """Return a configured stripe module or None when running in mock mode."""
    # Force mock mode for dev environment
    if settings.ENVIRONMENT == "dev":
        logger.info("Running in DEV environment - Forcing Mock Stripe Mode")
        return None
        
    if not settings.STRIPE_SECRET_KEY:
        logger.warning("STRIPE_SECRET_KEY not set - Falling back to Mock Stripe Mode")
        return None
        
    import stripe as _stripe
    _stripe.api_key = settings.STRIPE_SECRET_KEY
    return _stripe

# ---------------------------------------------------------------------------
# P0: Create PaymentIntent (Stripe) or mock payment (dev/test mode)
# ---------------------------------------------------------------------------

@router.post("/intent", response_model=schemas.PaymentIntentResponse)
@limiter.limit("3/minute")  # P1: Prevent Stripe API flooding
async def create_payment_intent(
    *,
    request: Request,  # Required by slowapi
    db: Session = Depends(deps.get_db),
    payment_in: schemas.PaymentIntentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Step 1 of the payment flow.
    Creates a Stripe PaymentIntent and a pending Payment record in our DB.
    The mobile client receives `client_secret` and passes it to the Stripe SDK
    to present the Payment Sheet — card data never touches our backend.
    """
    competition_id = str(payment_in.competition_id)
    comp = db.query(models.Competition).filter(models.Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")

    stripe = _get_stripe()

    if stripe:
        # --- REAL Stripe path ---
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(payment_in.amount * 100),  # Stripe uses smallest currency unit (cents)
                currency="usd",
                metadata={
                    "user_id": str(current_user.id),
                    "competition_id": competition_id,
                },
                automatic_payment_methods={"enabled": True},
            )
        except stripe.error.StripeError as exc:
            logger.error(f"Stripe PaymentIntent creation failed: {exc}")
            raise HTTPException(status_code=502, detail="Payment provider error. Please try again.")

        payment = models.Payment(
            user_id=str(current_user.id),
            competition_id=competition_id,
            amount=payment_in.amount,
            status="pending",
            stripe_payment_intent_id=intent["id"],
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return schemas.PaymentIntentResponse(
            payment_record_id=payment.id,
            client_secret=intent["client_secret"],
            publishable_key=settings.STRIPE_PUBLISHABLE_KEY or "",
            amount=payment_in.amount,
        )
    else:
        # --- MOCK path (no STRIPE_SECRET_KEY set) ---
        logger.warning("Stripe not configured — using mock payment. Set STRIPE_SECRET_KEY for production.")
        import asyncio
        await asyncio.sleep(1.5)

        payment = models.Payment(
            user_id=str(current_user.id),
            competition_id=competition_id,
            amount=payment_in.amount,
            status="completed",
            transaction_id=str(uuid.uuid4()),
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # In mock mode, return a fake client_secret so the mobile flow can bypass Stripe SDK.
        return schemas.PaymentIntentResponse(
            payment_record_id=payment.id,
            client_secret="mock_secret",
            publishable_key="mock_pk",
            amount=payment_in.amount,
        )


# ---------------------------------------------------------------------------
# P0: Stripe webhook — receives async payment outcomes from Stripe
# ---------------------------------------------------------------------------

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(request: Request, db: Session = Depends(deps.get_db)) -> Any:
    """
    Stripe calls this endpoint after payment confirmation/failure.
    The endpoint verifies the Stripe signature, then updates Payment.status.
    Register this URL in your Stripe Dashboard → Developers → Webhooks.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    stripe = _get_stripe()
    if not stripe:
        # Mock mode — no webhook processing needed
        return {"status": "mock_ok"}

    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        logger.error("Stripe webhook signature verification failed")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    intent = event["data"]["object"]
    stripe_pi_id = intent.get("id")

    payment = db.query(models.Payment).filter(
        models.Payment.stripe_payment_intent_id == stripe_pi_id
    ).first()

    if not payment:
        # Unknown payment — return 200 so Stripe does not retry endlessly
        logger.warning(f"Webhook received for unknown PaymentIntent: {stripe_pi_id}")
        return {"status": "unknown"}

    if event["type"] == "payment_intent.succeeded":
        payment.status = "completed"
        payment.transaction_id = stripe_pi_id
        db.commit()
        logger.info(f"Payment {payment.id} marked completed via webhook")

    elif event["type"] in ("payment_intent.payment_failed", "payment_intent.canceled"):
        payment.status = "failed"
        db.commit()
        logger.info(f"Payment {payment.id} marked failed via webhook (event: {event['type']})")

    return {"status": "processed"}


# ---------------------------------------------------------------------------
# P0: Refund endpoint (admin only)
# ---------------------------------------------------------------------------

@router.post("/{payment_id}/refund", response_model=schemas.PaymentRefundResponse)
async def refund_payment(
    *,
    db: Session = Depends(deps.get_db),
    payment_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Issues a Stripe refund for a completed payment and updates our DB.
    Restricted to admin users only.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status not in ("completed",):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot refund a payment with status '{payment.status}'.",
        )

    stripe = _get_stripe()

    if stripe and payment.stripe_payment_intent_id:
        try:
            refund = stripe.Refund.create(payment_intent=payment.stripe_payment_intent_id)
            payment.refund_id = refund["id"]
        except stripe.error.StripeError as exc:
            logger.error(f"Stripe refund failed for payment {payment_id}: {exc}")
            raise HTTPException(status_code=502, detail="Refund failed at payment provider. Please retry.")
    else:
        # Mock mode
        payment.refund_id = f"mock_refund_{uuid.uuid4().hex[:8]}"

    payment.status = "refunded"
    payment.refunded_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(payment)

    logger.info(f"Payment {payment.id} refunded (refund_id={payment.refund_id})")

    return schemas.PaymentRefundResponse(
        payment_id=payment.id,
        refund_id=payment.refund_id,
        status=payment.status,
        refunded_at=payment.refunded_at,
    )


# ---------------------------------------------------------------------------
# Existing: List payments for current user
# ---------------------------------------------------------------------------

@router.get("/me", response_model=list[schemas.PaymentResponse])
def get_my_payments(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Return all payments made by the current user."""
    return db.query(models.Payment).filter(models.Payment.user_id == current_user.id).all()
