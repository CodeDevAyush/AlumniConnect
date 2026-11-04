from fastapi import APIRouter, Depends
from app.schemas.capability import CapabilityAssessmentRequest, CapabilityAssessmentResponse
from app.services.capability_service import capability_service
from app.core.security import verify_internal_api_key

router = APIRouter()


@router.post(
    "/capability/assess",
    response_model=CapabilityAssessmentResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Capability Assessment"],
)
async def assess_capability(request: CapabilityAssessmentRequest):
    """
    Computes multi-dimensional capability rating across coding, portfolio, and interview metrics.
    Requires internal service authentication.
    """
    return capability_service.evaluate(request)
