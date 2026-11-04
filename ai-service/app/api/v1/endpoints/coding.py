from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.coding import (
    CodingProfileAnalysisRequest,
    CombinedCodingAnalysisResult,
)
from app.services.coding_analysis_service import coding_analysis_service

router = APIRouter()


@router.post(
    "/coding/analyze",
    response_model=CombinedCodingAnalysisResult,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Coding Analysis"],
)
async def analyze_coding_profiles(request: CodingProfileAnalysisRequest):
    """
    Analyzes Codeforces and LeetCode performance metrics, calculates normalized scores,
    and returns consistency & algorithmic maturity ratings.
    Requires internal service authentication.
    """
    return await coding_analysis_service.analyze(request)
