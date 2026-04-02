# Implementation Plan: Fix User Registration & Verification

The user reported two main issues with the registration flow:
1. Registration response contains null `first_name` and `last_name`.
2. Verification code (OTP) is not received via email.

## 🛠️ Changes Implemented

### 1. 📂 Backend Code Architecture Updates
- **Models**: Added a new `otp` column to the `User` model in `backend/app/models.py`.
- **Database**: Manually updated the PostgreSQL database to add the missing `otp` column to the existing table using SQL: `ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);`.
- **Email Service**: Created `backend/app/services/email.py` for simulated email sending. It logs the verification codes clearly to the backend console.
- **Schemas**: Updated `UserResponse` in `backend/app/schemas.py` to include an `access_token` and `token_type` so registration can log the user in immediately for email verification.

### 2. 🔐 Authentication Logic Enhancements
- **Registration**: Updated `/auth/register` to:
    - Capture and store `first_name` and `last_name`.
    - Generate a secure 6-digit numeric OTP.
    - Call the simulated email service.
    - Return a JWT `access_token` so the session starts immediately.
    - Set the user as `is_active=False` until verification is complete.
- **Verification**: Updated `/auth/verify-email` to:
    - Validate the provided OTP against the one stored in the user's record.
    - Activate the user (`is_active=True`) and clear the OTP after successful verification.

### 3. 📱 Mobile Application Enhancements
- **Auth Screen**: Updated `mobile/src/screens/AuthScreen.js` to:
    - Include `First Name` and `Last Name` input fields in the registration form.
    - Validate that all required fields are filled.
    - Use the new centralized `register` function from `AppContext`.
- **Global Context**: Added a `register` function to `mobile/src/context/AppContext.js` to manage registration, token storage in `AsyncStorage`, and user state centrally.

## 🧪 Verification Steps
1. Navigate to the **Create Account** screen on the mobile app.
2. Fill in the **First Name**, **Last Name**, **Email**, and **Password**.
3. Click **Create Account**.
4. Check the **backend logs** for the verification code (it will be printed in a box like `[EMAIL] To: user@email.com | OTP: 123456`).
5. Enter the 6-digit code on the **Verify Email** screen.
6. If successful, you will be navigated to the competition eligibility check.

> [!NOTE]
> Since this is a prototype/MVP environment, email delivery is currently simulated via console logs. In production, the `email_service.py` should be updated with real SMTP/SES credentials.
