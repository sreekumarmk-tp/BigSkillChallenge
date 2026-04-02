from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, competition, payment, submission
from app.database import engine
from app import models

# Create tables
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database connection failed. It might not be ready yet.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(competition.router, prefix=f"{settings.API_V1_STR}/competitions", tags=["competitions"])
app.include_router(payment.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(submission.router, prefix=f"{settings.API_V1_STR}/submissions", tags=["submissions"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Big Skill Challenge API"}
