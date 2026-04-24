from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# P1: Connection pooling — handles burst traffic without exhausting DB connections.
# pool_size: number of persistent connections kept open.
# max_overflow: extra connections allowed above pool_size under load.
# pool_pre_ping: validates connections before use, handles stale connections.
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=1800,  # Recycle connections every 30 min to avoid server-side timeouts.
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
