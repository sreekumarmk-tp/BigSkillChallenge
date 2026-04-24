import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.core.redis import get_redis_pool
from arq.connections import RedisSettings

@pytest.mark.asyncio
async def test_get_redis_pool():
    # Mock create_pool and from_url
    with patch("app.core.redis.create_pool", new_callable=AsyncMock) as mock_create_pool:
        with patch("redis.asyncio.from_url") as mock_from_url:
            # Set up mock redis connection
            mock_conn = MagicMock()
            mock_conn.connection_pool.connection_kwargs = {
                'host': 'testhost',
                'port': 1234,
                'db': 1,
                'password': 'testpassword'
            }
            mock_from_url.return_value = mock_conn
            
            await get_redis_pool()
            
            # Verify create_pool was called with correct settings
            mock_create_pool.assert_called_once()
            args, kwargs = mock_create_pool.call_args
            settings = args[0]
            assert isinstance(settings, RedisSettings)
            assert settings.host == 'testhost'
            assert settings.port == 1234
            assert settings.database == 1
            assert settings.password == 'testpassword'
