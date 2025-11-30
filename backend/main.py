from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import httpx
import logging
import json

from config import settings
from database import create_db_and_tables, get_session
from models import User, Breed
from redis_client import RedisClient, get_redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup: Create database tables and initialize Redis
    create_db_and_tables()
    try:
        RedisClient.get_client()
        logger.info("Redis client initialized")
    except Exception as e:
        logger.warning(f"Redis initialization failed: {e}")
    yield
    # Shutdown: Close Redis connection
    RedisClient.close()


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)


@app.get("/api")
def read_root():
    """Root endpoint"""
    return {"message": "Welcome to Olive API"}


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api/redis/health")
def redis_health_check(redis_client=Depends(get_redis)):
    """Redis health check endpoint"""
    try:
        redis_client.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Redis unavailable: {str(e)}")


# Example CRUD endpoints for User model
@app.post("/api/users", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    """Create a new user"""
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.get("/api/users", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    """Get all users"""
    users = session.exec(select(User)).all()
    return users


@app.get("/api/users/{user_id}", response_model=User)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Get a specific user by ID"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/api/users/{user_id}", response_model=User)
def update_user(user_id: int, user_update: User, session: Session = Depends(get_session)):
    """Update a user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_update.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    """Delete a user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}


@app.get("/api/me", response_model=User)
def get_me():
    """Get current user (returns test user)"""
    from datetime import datetime
    return User(
        id=1,
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

@app.get("/api/breeds")
async def get_breeds(
    page: int = 1,
    page_size: int = 10,
    accurate_entries: bool = False,
    redis_client=Depends(get_redis)
):
    """Get paginated list of breeds with images from external API (with Redis caching)"""
    if page < 1:
        raise HTTPException(status_code=400, detail="Page number must be >= 1")
    if page_size < 1 or page_size > 15:
        raise HTTPException(status_code=400, detail="Page size must be between 1 and 15")

    # Fetch breeds from external API
    external_api_url = f"https://interview-api-olive.vercel.app/api/dogs?page={page}"

    # Create cache key based on the request URL and page_size
    cache_key = f"breeds:page={page}:size={page_size}"

    # Check Redis cache first
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            logger.info(f"Cache hit for {cache_key}")
            return json.loads(cached_data)
    except Exception as e:
        logger.warning(f"Redis get failed: {e}")

    try:
        async with httpx.AsyncClient() as client:
            breeds_data = None
            result_count_matches = False

            # Try fetching from API (with one retry if count doesn't match)
            for attempt in range(2):
                response = await client.get(external_api_url)

                # Check HTTP status code explicitly
                if response.status_code != 200:
                    logger.error(f"External API returned non-200 status: {response.status_code}")
                    # Try to get error details from response body
                    try:
                        error_data = response.json()
                        if isinstance(error_data, dict) and "error" in error_data:
                            logger.error(f"Error details: {error_data['error']}")
                    except Exception:
                        pass
                    raise HTTPException(
                        status_code=503,
                        detail=f"External API error: HTTP {response.status_code}"
                    )

                breeds_data = response.json()

                # Check if response is an object with an error field
                if isinstance(breeds_data, dict):
                    if "error" in breeds_data:
                        logger.error(f"External API returned error: {breeds_data['error']}")
                        return {"items": []}
                    # If it's a dict but not an error, log and return empty
                    logger.warning(f"Unexpected object response from external API: {breeds_data}")
                    return {"items": []}

                # If it's not a list, return empty
                if not isinstance(breeds_data, list):
                    logger.error(f"Unexpected response type from external API: {type(breeds_data)}")
                    return {"items": []}

                # Check if we got the expected number of results
                if len(breeds_data) == page_size:
                    result_count_matches = True
                    logger.info(f"Received expected count ({page_size}) on attempt {attempt + 1}")
                    break
                else:
                    logger.warning(f"Attempt {attempt + 1}: Expected {page_size} results, got {len(breeds_data)}")
                    if attempt == 0:
                        logger.info("Retrying API call due to count mismatch")

            # Add IDs to the breeds
            breeds_with_ids = [
                {
                    "id": idx + 1 + ((page - 1) * page_size),
                    "breed": breed["breed"],
                    "image": breed.get("image", "")
                }
                for idx, breed in enumerate(breeds_data[:page_size])
            ]

            # Format response with items field
            result = {"items": breeds_with_ids}

            # Only cache if we got the expected number of results
            if result_count_matches:
                try:
                    redis_client.setex(cache_key, 100, json.dumps(result))
                    logger.info(f"Cached response for {cache_key}")
                except Exception as e:
                    logger.warning(f"Redis setex failed: {e}")
            else:
                logger.warning(f"Skipping cache due to result count mismatch (expected {page_size}, got {len(breeds_data)})")

            return result

    except httpx.HTTPError as e:
        logger.error(f"HTTP error fetching breeds from external API: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to fetch breeds from external API: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level
    )
