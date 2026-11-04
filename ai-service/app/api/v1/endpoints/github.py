from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.services.github_analysis_service import github_analysis_service

router = APIRouter()


@router.get(
    "/github/evaluate/{username}",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["GitHub Integration"],
)
async def evaluate_github_user(username: str):
    """
    Performs deep analysis of a student's public repositories, commit cadence,
    language breakdown, and engineering hygiene (tests, Docker, CI/CD, docs).
    Requires internal service authentication.
    """
    return await github_analysis_service.analyze_student_github(username)
