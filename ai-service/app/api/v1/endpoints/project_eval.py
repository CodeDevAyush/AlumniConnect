from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.code_quality import (
    ProjectQualityCheckRequest,
    ProjectQualityCheckResult,
)
from app.schemas.project_eval import (
    ProjectEvaluationResult,
    ProjectSubmissionRequest,
)
from app.services.code_quality_service import code_quality_service
from app.services.project_evaluation_service import project_evaluation_service

router = APIRouter()


@router.post(
    "/projects/evaluate",
    response_model=ProjectEvaluationResult,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Project Evaluation"],
)
async def evaluate_project_submission(request: ProjectSubmissionRequest):
    """
    Evaluates project submissions across multi-criteria rubrics (modularity,
    tech stack depth, test evidence, documentation, deployment) and provides
    Gemini-powered qualitative architectural feedback.
    Requires internal service authentication.
    """
    return await project_evaluation_service.evaluate_project(request)


@router.post(
    "/projects/quality-check",
    response_model=ProjectQualityCheckResult,
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Project Evaluation"],
)
async def run_top_project_quality_check(request: ProjectQualityCheckRequest):
    """
    Runs deep code quality validation combining GitHub REST API, SonarQube/SonarCloud
    quality gates, Semgrep SAST security rules, and Gemini architecture critique.
    """
    return await code_quality_service.analyze_project_quality(request)


@router.get(
    "/projects/user-repos/{username}",
    response_model=List[Dict[str, Any]],
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Project Evaluation"],
)
async def get_user_repositories(username: str):
    """
    Fetches the candidate's public repositories using GitHub REST API.
    """
    return await code_quality_service.get_user_repositories(username)
