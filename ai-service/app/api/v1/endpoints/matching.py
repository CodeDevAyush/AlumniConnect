from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.matching import (
    AlumniMatchRequest,
    AlumniMatchResponse,
)
from app.services.matching_engine import matching_engine

router = APIRouter()


@router.post(
    "/matching/alumni",
    response_model=AlumniMatchResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Alumni Matching"],
)
async def match_alumni(request: AlumniMatchRequest):
    """
    Computes explainable multi-factor matches between student profile and verified alumni
    using TF-IDF semantic vector similarity, track alignment, and referral willingness.
    Requires internal service authentication.
    """
    return matching_engine.match(request)
