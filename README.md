# Big AI Challenge - MVP Platform

The **Big AI Challenge** is a mobile-first platform where users can register, participate in creative competitions, submit exactly 25-word responses, and receive deterministic AI-based scoring. This repository contains both the mobile application built with React Native (Expo) and the backend service built with FastAPI and PostgreSQL.

## 🏗 System Architecture

The project is split into two distinct directories to separate concerns:

1. **`mobile/`**: The frontend React Native application designed with a premium neon-glassmorphism theme. Features custom hero animations, interactive countdowns, and a secure submission pipeline.
2. **`backend/`**: The FastAPI-powered API, exposing endpoints for User Authentication (JWT), Competitions, Payment mocks, Submissions, and the Orchestrated AI Scoring Engine.
3. **`admin/`**: Integrated SQLAlchemy Admin panel to manage the competition ecosystem, evaluate winners, and monitor real-time statistics.
4. **Database**: A PostgreSQL instance (UUID-based schema) for robust data persistence and relational integrity.

### 🏗 Architecture Diagram

```mermaid
graph TD
    User["User (Mobile App)"] -- "REST API" --> API["FastAPI Backend"]
    Admin["Admin (Web Browser)"] -- "HTTPS" --> AdminPanel["SQLAlchemy Admin"]
    
    subgraph backend ["Backend Service"]
        API
        AdminPanel
        Auth["Auth Service (JWT/OTP)"]
        Scoring["AI Scoring Engine (LangGraph)"]
        Tracing["LangSmith Tracing"]
    end
    
    subgraph persistence ["Data Layer"]
        DB[(PostgreSQL Database)]
    end
    
    API <--> Auth
    API <--> Scoring
    Scoring <--> Tracing
    API <--> DB
    AdminPanel <--> DB
```

---

## 🚀 Quick Start Guide

### 1. Starting the Backend (FastAPI & PostgreSQL)

The backend runs on **Python 3.10+** and uses **Docker Compose** to manage the PostgreSQL database.

```bash
# Navigate to the backend directory
cd backend

# Create your .env file
cp .env.example .env
# Edit .env and add your details (especially SMTP for OTP and LangSmith keys)
```

#### 🤖 Choosing Your AI Provider

The scoring engine supports multiple LLM backends. Configure this in `backend/.env` via `LLM_PROVIDER`:

| Provider | Best For... | Requirements |
| :--- | :--- | :--- |
| **Groq** | **Speed & Latency**. Near-instant scoring. | `GROQ_API_KEY` (from console.groq.com) |
| **Gemini** | **Reasoning & Reliability**. Google's flagship models. | `LLM_API_KEY` (from aistudio.google.com) |
| **Ollama** | **Privacy & Local Dev**. 100% offline, no API costs. | Local [Ollama](https://ollama.com/) installation + `gemma2` or `llama3` model. |
| **Mock** | **Testing**. Deterministic scores without calling any API. | No API key required. |

> [!TIP]
> For production-grade speed, **Groq** is recommended. For local development without internet, **Ollama** is the best choice.

#### 📦 Environment Setup (using `uv`)

We recommend using [uv](https://github.com/astral-sh/uv) for extremely fast dependency installation.

```bash
# 1. Install uv
# Via pip (recommended if pip is already installed):
pip install uv

# OR via standalone installer:
# Linux/macOS: curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows: powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Setup and Activate Virtual Environment
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies from requirements.txt
uv pip install -r requirements.txt
```

```bash
# Start the FastAPI server
# Note: The backend will automatically detect if PostgreSQL is running locally.
# If not found, it will attempt to start it via Docker Compose.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> [!TIP]
> You can also run the database setup manually using `python scripts/setup_db.py`.
> The API will be available at `http://localhost:8000`.
> The **Admin Panel** is available at `http://localhost:8000/admin`.
> - **Default Admin**: `admin@bigskillchallenge.com` / `admin123_change_me`







### 3. Starting the Mobile Application (React Native / Expo)

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Create mobile env
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000/api/v1

# Start Expo
npx expo start
```


## 🔄 Project Workflow

```mermaid
graph LR
    Start([Registration]) --> OTP[Email OTP Verification]
    OTP --> Dashboard[User Dashboard]
    Dashboard --> Pay[Mock Payment Integration]
    Pay --> Quiz{AI Skill Quiz}
    Quiz -- Pass --> Submit[25-Word Submission]
    Submit --> Scoring[Orchestrated AI Scoring]
    Scoring --> Rank[Percentile & Rank Engine]
    Rank --> Audit[Hash-sealed Audit Trail]
    Audit --> Winner([Winner Selection])
```

## 🛠 Feature Scope

- **Advanced AI Scoring (LangGraph)**:
  - Parallel evaluation of `Relevance`, `Creativity`, `Clarity`, and `Impact`.
  - **Reflection Node**: Detects scoring divergence and triggers an "Adjustment" node for harmonization.
  - **LangSmith Integration**: Full tracing of every scoring event for debugging and quality monitoring.
  - **Multi-Provider Support**: Seamlessly switch between local Ollama, Groq, and Gemini.
- **Percentile & Ranking Engine**: Real-time calculation of user performance against the entire competition pool.
- **Immutable Audit Trails**: Every submission generates a hash-sealed timeline of events (Submission -> AI Scoring -> Shortlisting) for transparency.
- **AI-Focused Quiz Module**: 50+ curated questions on Agentic AI, RAG, MCP, and GenAI architectures to ensure a high-skill participant pool.
- **Premium UI/UX**:
  - Dark-mode glassmorphism with neon accents (`#00F0FF`).
  - Hero sections with animated imagery and real-time countdowns.
  - Native hooks to prevent copy-pasting on submission screens.
- **Secure Admin Dashboard**: 
  - Real-time statistics on participation and scores.
  - Manual shortlisting and winner selection tools.

## 📋 Completed Development

- [x] **Rebranded to Big AI Challenge** with updated prize details (1-Year OpenAI Subscription).
- [x] **LangGraph Orchestrator** with parallel nodes and reflection logic.
- [x] **LangSmith Tracing** integration for AI pipeline observability.
- [x] **Percentile Response Schema** and ranking logic in backend.
- [x] **Immutable Audit Trails** using SHA-256 hash sealing for submission events.
- [x] **Enhanced Email Flow** with state-managed verification status.
- [x] **AI-Themed Quiz** seeded with 50+ expert-level questions.
- [x] **Premium Landing Screen** with hero imagery, staggered animations, and trust indicators.
- [x] **SQLAlchemy Admin** with restricted permissions and statistical dashboard.
- [x] **Mobile State Management** using Context API for cross-screen persistence.
- [x] **Paste-Blocking Hooks** implemented on creative submission screens.

