from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.data.taxonomies import TECHNICAL_TRACKS
from app.schemas.capability import (
    CapabilityAssessmentResult,
    StudentEvidencePayload,
)
from app.services.capability_engine import capability_engine

router = APIRouter()


@router.get(
    "/capability/tracks",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Capability Assessment"],
)
async def get_available_tracks():
    """Returns all supported technical tracks, dimension weights, and benchmark skills."""
    return {
        "totalTracks": len(TECHNICAL_TRACKS),
        "tracks": [
            {
                "key": k,
                "title": v["title"],
                "description": v["description"],
                "requiredSkills": v["required_skills"],
                "weights": v["weights"],
            }
            for k, v in TECHNICAL_TRACKS.items()
        ],
    }


@router.post(
    "/capability/assess",
    response_model=CapabilityAssessmentResult,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Capability Assessment"],
)
async def assess_student_capability(payload: StudentEvidencePayload):
    """
    Evaluates student technical capability across 5 dimensions:
    1. Coding Performance
    2. Development Capability
    3. Technical Fundamentals
    4. Practical Application
    5. Consistency and Growth
    
    Missing evidence is tracked separately and never penalized as zero.
    Requires internal service authentication.
    """
    return await capability_engine.evaluate(payload)
