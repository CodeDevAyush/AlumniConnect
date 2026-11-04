from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings

API_KEY_HEADER = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)


async def verify_internal_api_key(api_key: str = Security(API_KEY_HEADER)) -> str:
    """
    Enforces internal service authentication between the NestJS backend and FastAPI.
    Requests without a valid X-Internal-API-Key header are rejected.
    """
    if not api_key or api_key != settings.INTERNAL_API_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key
