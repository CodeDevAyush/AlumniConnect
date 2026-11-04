from fastapi import APIRouter, Depends
from app.schemas.recommendations import (
    CareerRecommendationRequest,
    CareerRecommendationResponse,
)
from app.services.recommendation_service import recommendation_service
from app.core.security import verify_internal_api_key

router = APIRouter()


@router.post(
    "/recommendations/career",
    response_model=CareerRecommendationResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Career Recommendations"],
)
async def get_career_recommendations(request: CareerRecommendationRequest):
    """
    Synthesizes current skill competencies into an actionable phased career milestone pathway.
    Requires internal service authentication.
    """
    return recommendation_service.generate_recommendations(request)
