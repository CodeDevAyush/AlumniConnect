from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    matching,
    skill_gap,
    capability,
    coding,
    github,
    project_eval,
    recommendations,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(matching.router)
api_router.include_router(skill_gap.router)
api_router.include_router(capability.router)
api_router.include_router(coding.router)
api_router.include_router(github.router)
api_router.include_router(project_eval.router)
api_router.include_router(recommendations.router)
