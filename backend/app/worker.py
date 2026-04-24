import logging
from arq.connections import RedisSettings
from app.core.config import settings
from app.services.ai_adapter import evaluate_entry
from app import models
from app.database import SessionLocal

logger = logging.getLogger(__name__)

async def score_entry_task(ctx, entry_id: str, content: str):
    """
    Persistent background task for AI scoring.
    """
    db = SessionLocal()
    try:
        logger.info(f"Starting scoring for entry {entry_id}")
        scoring_result = await evaluate_entry(content)
        
        entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
        if not entry:
            logger.error(f"Entry {entry_id} not found in worker.")
            return

        score = models.Score(
            entry_id=entry_id,
            relevance_score=scoring_result.relevance_score,
            creativity_score=scoring_result.creativity_score,
            clarity_score=scoring_result.clarity_score,
            impact_score=scoring_result.impact_score,
            total_score=scoring_result.total_score,
            feedback=scoring_result.feedback,
            prompt_version=scoring_result.prompt_version,
        )
        db.add(score)
        entry.status = "scored"
        db.commit()
        logger.info(f"Successfully scored entry {entry_id}")
        
    except Exception as exc:
        logger.error(f"Worker scoring failed for {entry_id}: {exc}")
        # In a real system, you might want to retry here or leave status as 'submitted'
    finally:
        db.close()

async def startup(ctx):
    logger.info("Worker starting up...")

async def shutdown(ctx):
    logger.info("Worker shutting down...")

# Parse REDIS_URL for WorkerSettings
from redis.asyncio import from_url
_redis_conn = from_url(settings.REDIS_URL)
_host = _redis_conn.connection_pool.connection_kwargs.get('host', 'localhost')
_port = _redis_conn.connection_pool.connection_kwargs.get('port', 6379)
_db = _redis_conn.connection_pool.connection_kwargs.get('db', 0)
_password = _redis_conn.connection_pool.connection_kwargs.get('password')

class WorkerSettings:
    functions = [score_entry_task]
    redis_settings = RedisSettings(host=_host, port=_port, database=_db, password=_password)
    on_startup = startup
    on_shutdown = shutdown
