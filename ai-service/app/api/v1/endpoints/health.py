from fastapi import APIRouter
from app.core.config import settings
from app.integrations.gemini_client import gemini_client

router = APIRouter()


@router.get("/health", tags=["Health"])
async def get_health():
    """Unauthenticated health & diagnostics probe for Docker, Kubernetes, and uptime monitoring."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "integrations": {
            "geminiConfigured": gemini_client.is_configured,
            "githubConfigured": bool(settings.GITHUB_PERSONAL_ACCESS_TOKEN),
            "codeforcesIntegration": "active",
            "leetcodeIntegration": "active",
        },
        "supportedTracks": [
            "SDE",
            "FRONTEND",
            "BACKEND",
            "FULLSTACK",
            "AIML",
            "DATA_ANALYST",
            "DATA_ENGINEER",
            "COMPETITIVE_PROGRAMMER",
        ],
    }
