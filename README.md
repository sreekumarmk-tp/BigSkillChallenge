# Big Skill Challenge - MVP Platform

The **Big Skill Challenge** is a mobile-first platform where users can register, participate in creative competitions, submit exactly 25-word responses, and receive deterministic AI-based scoring. This repository contains both the mobile application built with React Native (Expo) and the backend service built with FastAPI and PostgreSQL.

## 🏗 System Architecture

The project is split into two distinct directories to separate concerns:

1. **`mobile/`**: The frontend React Native application designed mimicking the client prototype (dark glassmorphism theme). It communicates with the backend via RESTful APIs using Axios.
2. **`backend/`**: The FastAPI-powered API, exposing endpoints for User Authentication (JWT), Competitions, Payment mocks, Submissions, and the AI Scoring Engine.
3. **Database**: A PostgreSQL instance containerized via Docker for data persistence.

---

## 🚀 Quick Start Guide

### 1. Starting the Backend (FastAPI & PostgreSQL)

The backend runs on **Python 3.10+** and uses **Docker Compose** to manage the PostgreSQL database.

```bash
# Navigate to the backend directory
cd backend

# Start the PostgreSQL database using Docker
docker-compose up -d

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (auto-creates DB tables on launch)
uvicorn app.main:app --reload --port 8000
```
> The API will be available at `http://localhost:8000`
> The interactive Swagger documentation is hosted natively at `http://localhost:8000/docs`.

### 2. Starting the Mobile Application (React Native / Expo)

The frontend uses Expo to ensure a fast, robust mobile development timeline. You will need **Node.js** and **npm** installed.

```bash
# Navigate to the mobile directory
cd mobile

# Install NPM dependencies
npm install

# Start the Expo development server
npx expo start
```
> You can run the app directly on your physical device by downloading the **Expo Go** app and scanning the provided QR code, or by pressing `a` to open it in an Android Emulator / `i` to open it in an iOS Simulator.

---

## 🛠 Feature Scope

Based on the core prototypes, the MVP contains the following foundational scaffolding:

- **Authentication System**: Secure JWT-based user registration and login implementation mimicking the HTML tabs.
- **Competition Flow**: Secure API structure outlining eligibility checks and active entry points.
- **Mock Payments**: Payment integration layer ready to be substituted with Stripe / Razorpay logic upon production launch.
- **25-Word AI Submission**:
  - The API strictly endpoints validations checking verbatim for 25-word creative entries.
  - An `ai_adapter.py` adapter prepares deterministic prompts linking to local (Ollama) or cloud (Groq/Gemini) Language Models.
  - The response yields structured metrics (`Relevance`, `Creativity`, `Clarity`, `Impact`) mimicking the immutable audit trail provided.
- **Aesthetic System Layout**: React Native constants configuring `linear-gradients`, `#F59E0B` CTA buttons and translucent glass borders.

## 📋 Completed Development

- [x] Complete robust Redux / Context API State management in React Native for active cross-screen memory.
- [x] Connect absolute production API keys inside the backend `.env`.
- [x] Map the exact countdown interval logic mapping to the explicit 30-second localized quiz states (`07-quiz.html`).
- [x] Implement Paste-Blocking behavior hooks purely natively on the React `SubmissionScreen`.

