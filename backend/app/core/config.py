import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Big Skill Challenge MVP"
    ENVIRONMENT: str = "dev" # options: "dev", "qa", "prod"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Admin Panel
    ADMIN_EMAIL: str = "admin@bigskillchallenge.com"
    ADMIN_PASSWORD: str = "admin123_change_me"
    
    # DB settings
    POSTGRES_USER: str = "bigskill"
    POSTGRES_PASSWORD: str = "bigskill_password"
    POSTGRES_DB: str = "bigskill_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    
    # SMTP Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = "Big Skill Challenge"

    # LLM Settings
    LLM_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "ollama" # options: "mock", "gemini", "groq", "ollama"
    LLM_MODEL: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:3000"

    # LangSmith Tracing
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_ENDPOINT: Optional[str] = "https://api.smith.langchain.com"
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: Optional[str] = "Big-Skill-Challenge"

    # -----------------------------------------------------------------------
    # P0: Stripe payment settings
    # Set STRIPE_SECRET_KEY to your live/test secret key from stripe.com.
    # Set STRIPE_WEBHOOK_SECRET to the signing secret from your webhook endpoint.
    # -----------------------------------------------------------------------
    STRIPE_SECRET_KEY: Optional[str] = None          # sk_live_... or sk_test_...
    STRIPE_WEBHOOK_SECRET: Optional[str] = None      # whsec_...
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None     # pk_live_... or pk_test_...

    # -----------------------------------------------------------------------
    # P0/P1: Competition integrity settings
    # -----------------------------------------------------------------------
    # Maximum creative entries a single user may submit per competition.
    MAX_ENTRIES_PER_USER: int = 10
    # Minutes after a quiz pass within which a creative submission is accepted.
    # Set to 0 to disable the window entirely.
    SUBMISSION_WINDOW_MINUTES: int = 60

    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

# Export LangChain/LangSmith env vars so the SDKs can find them
if settings.LANGCHAIN_TRACING_V2 == "true":
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    if settings.LANGCHAIN_ENDPOINT:
        os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
    if settings.LANGCHAIN_API_KEY:
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
    if settings.LANGCHAIN_PROJECT:
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
