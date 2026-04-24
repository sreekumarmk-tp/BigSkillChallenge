# Mobile E2E Integration Guide

This project uses **Maestro** for End-to-End (E2E) integration testing. Maestro allows for reliable, high-level UI automation that works across iOS and Android.

## Setup

1.  **Install Maestro CLI**:
    ```bash
    curl -Ls "https://get.maestro.mobile.dev" | bash
    ```
2.  **Ensure your app is running**:
    *   Start the backend: `cd backend && uvicorn app.main:app --reload`
    *   Start the mobile app: `cd mobile && npx expo start`
    *   Open the app in an emulator (iOS Simulator or Android Emulator).

## Running Flows

All E2E flows are located in `mobile/.maestro/`.

### 1. Authentication & Onboarding Flow
This test covers the journey from the Landing screen, through Registration, Email Verification, and reaching the Eligibility screen.

```bash
maestro test mobile/.maestro/AuthFlow.yaml
```

### 2. Full Challenge Flow
This test covers the journey from the Dashboard, through Eligibility, Payment, Quiz completion, and Creative Submission.

```bash
maestro test mobile/.maestro/ChallengeFlow.yaml
```

## Adding New Tests

When adding new tests, use the `testID` property in React Native components. The existing flows use IDs like:
*   `landing-enter-button`
*   `email-input`
*   `auth-submit-button`
*   `quiz-option-A`
*   `creative-submission-input`

To see available IDs and screen hierarchy during development, use:
```bash
maestro hierarchy
```
