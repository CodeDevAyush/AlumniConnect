from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")


class ApiResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    statusCode: int = 200
    message: Optional[str] = None
    data: T
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    models_loaded: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
