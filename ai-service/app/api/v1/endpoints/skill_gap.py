from fastapi import APIRouter, Depends, Body
from app.core.security import verify_internal_api_key
from app.schemas.skill_gap import (
    JobDescriptionAnalysisRequest,
    SkillGapComparisonResult,
)
from app.services.skill_gap_engine import skill_gap_engine

router = APIRouter()


@router.post(
    "/skills/gap-analysis",
    response_model=SkillGapComparisonResult,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Skill Gap Analysis"],
)
async def analyze_skill_gap(request: JobDescriptionAnalysisRequest):
    """
    Analyzes job description requirements against student capability profile
    and produces a prioritized skill acquisition roadmap.
    Requires internal service authentication.
    """
    return await skill_gap_engine.analyze_gap(request)


@router.post(
    "/skills/extract-jd",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Skill Gap Analysis"],
)
async def extract_job_description_skills(
    jd_text: str = Body(..., embed=True, description="Raw job description text")
):
    """
    Uses Gemini LLM to extract required vs preferred skills, core concepts,
    and tools from raw job description text.
    Requires internal service authentication.
    """
    return await skill_gap_engine.extract_job_requirements(jd_text)
