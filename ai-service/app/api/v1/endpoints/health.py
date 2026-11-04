from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def get_health():
    """Unauthenticated health probe for Docker, Kubernetes, and uptime monitoring."""
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        models_loaded=["TfidfVectorizer", "CosineSimilarityBaseline", "SkillGapRuleEngine"],
    )
