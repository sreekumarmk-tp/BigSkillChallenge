from arq import create_pool
from arq.connections import RedisSettings
from app.core.config import settings

async def get_redis_pool():
    # Parse REDIS_URL for arq RedisSettings if needed, or just use host/port.
    # For simplicity, if REDIS_URL is a standard redis:// string:
    from redis.asyncio import from_url
    redis_conn = from_url(settings.REDIS_URL)
    host = redis_conn.connection_pool.connection_kwargs.get('host', 'localhost')
    port = redis_conn.connection_pool.connection_kwargs.get('port', 6379)
    db = redis_conn.connection_pool.connection_kwargs.get('db', 0)
    password = redis_conn.connection_pool.connection_kwargs.get('password')
    
    return await create_pool(RedisSettings(host=host, port=port, database=db, password=password))
