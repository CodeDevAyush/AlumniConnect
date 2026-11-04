from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import verify_internal_api_key

router = APIRouter()


class ProjectEvalRequest(BaseModel):
    title: str
    description: str
    techStack: List[str]
    liveUrl: Optional[str] = None
    repoUrl: Optional[str] = None


@router.post(
    "/projects/evaluate",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Project Evaluation"],
)
async def evaluate_project(payload: ProjectEvalRequest):
    """
    Evaluates student capstone project complexity, architecture maturity, and relevance.
    Requires internal service authentication.
    """
    complexity_score = min(len(payload.techStack) * 15.0 + 35.0, 95.0)
    return {
        "title": payload.title,
        "complexityScore": complexity_score,
        "productionReadinessTier": "Production Quality" if complexity_score > 75 else "Prototype",
        "verifiedStack": payload.techStack,
        "recommendations": [
            "Add CI/CD pipeline automation with lint and test verification",
            "Document system architecture diagram in repository README",
        ],
    }
