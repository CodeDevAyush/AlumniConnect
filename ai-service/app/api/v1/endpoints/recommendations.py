from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.recommendations import (
    CareerRecommendationRequest,
    CareerRecommendationResponse,
)
from app.services.career_guidance_engine import career_guidance_engine

router = APIRouter()


@router.post(
    "/recommendations/career",
    response_model=CareerRecommendationResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Career Guidance"],
)
async def get_career_guidance(request: CareerRecommendationRequest):
    """
    Generates personalized milestone roadmaps, recommended projects,
    and mock interview priorities grounded in student evidence.
    Requires internal service authentication.
    """
    return await career_guidance_engine.generate_guidance(request)
