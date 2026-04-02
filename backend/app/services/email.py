import logging
import aiosmtplib
from email.message import EmailMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_verification_email(email: str, otp: str):
    """
    Send verification email using actual SMTP or simulate if not configured.
    """
    subject = "Your Registration Verification Code"
    content = f"Thank you for registering! Your verification code is: {otp}"
    
    # Simulation if not configured
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"--- EMAIL SIMULATION (SMTP not configured) ---")
        logger.info(f"To: {email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body: {content}")
        logger.info(f"-------------------------")
        print(f"\n\n[EMAIL] To: {email} | OTP: {otp}\n\n")
        return

    # Actual SMTP sending
    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email
    message["Subject"] = subject
    message.set_content(content)

    try:
        # For port 587, we typically use STARTTLS (use_tls=False, start_tls=True)
        # For port 465, we use direct TLS (use_tls=True, start_tls=False)
        use_tls = settings.SMTP_TLS
        start_tls = False
        
        if settings.SMTP_PORT == 587:
            use_tls = False
            start_tls = True
        elif settings.SMTP_PORT == 465:
            use_tls = True
            start_tls = False

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=use_tls,
            start_tls=start_tls,
        )
        logger.info(f"Successfully sent verification email to {email}")
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {str(e)}")
        # Log to console as emergency fallback
        print(f"\n\n[ERROR-FALLBACK-EMAIL] To: {email} | OTP: {otp}\n\n")
