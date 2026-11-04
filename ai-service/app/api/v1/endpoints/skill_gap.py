from fastapi import APIRouter, Depends
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import skill_gap_service
from app.core.security import verify_internal_api_key

router = APIRouter()


@router.post(
    "/skills/gap-analysis",
    response_model=SkillGapResponse,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Skill Gap Analysis"],
)
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Evaluates candidate's current proficiencies against target market role benchmarks.
    Requires internal service authentication.
    """
    return skill_gap_service.analyze(request)
