from fastapi import APIRouter, Depends
from app.schemas.matching import AlumniMatchRequest, AlumniMatchResponse
from app.services.matching_service import matching_service
from app.core.security import verify_internal_api_key

router = APIRouter()


@router.post(
    "/matching/alumni",
    response_model=AlumniMatchResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Alumni Matching"],
)
async def match_alumni(request: AlumniMatchRequest):
    """
    Computes TF-IDF vector similarity and semantic overlap between
    student target profiles and alumni candidates.
    Requires internal service authentication.
    """
    return matching_service.match_alumni(request)
