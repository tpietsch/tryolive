import redis
from redis import Redis
import logging
from config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis client wrapper for managing connections"""

    _instance: Redis | None = None

    @classmethod
    def get_client(cls) -> Redis:
        """Get or create Redis client instance"""
        if cls._instance is None:
            try:
                cls._instance = redis.Redis(
                    host=settings.redis_host,
                    port=settings.redis_port,
                    db=settings.redis_db,
                    password=settings.redis_password if settings.redis_password else None,
                    decode_responses=True,  # Automatically decode responses to strings
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # Test connection
                cls._instance.ping()
                logger.info(f"Redis connected: {settings.redis_host}:{settings.redis_port}")
            except redis.ConnectionError as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise
        return cls._instance

    @classmethod
    def close(cls):
        """Close Redis connection"""
        if cls._instance is not None:
            cls._instance.close()
            cls._instance = None
            logger.info("Redis connection closed")


def get_redis() -> Redis:
    """Dependency function to get Redis client"""
    return RedisClient.get_client()
