from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Big Skill Challenge MVP"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # DB settings
    POSTGRES_USER: str = "bigskill"
    POSTGRES_PASSWORD: str = "bigskill_password"
    POSTGRES_DB: str = "bigskill_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    
    # LLM Settings
    LLM_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "mock"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True

settings = Settings()
