import logging

logger = logging.getLogger(__name__)

async def send_verification_email(email: str, otp: str):
    """
    Simulated verification email sender.
    In a real app, this would use a mail service like SendGrid, AWS SES, or SMTP.
    For this prototype, it logs the OTP to the console so it can be seen in backend logs.
    """
    logger.info(f"--- EMAIL SIMULATION ---")
    logger.info(f"To: {email}")
    logger.info(f"Subject: Your Registration Verification Code")
    logger.info(f"Body: Thank you for registering! Your verification code is: {otp}")
    logger.info(f"-------------------------")
    print(f"\n\n[EMAIL] To: {email} | OTP: {otp}\n\n") # Force to console output
