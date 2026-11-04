from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.project_eval import (
    ProjectEvaluationResult,
    ProjectSubmissionRequest,
)
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
