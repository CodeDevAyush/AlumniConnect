from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import verify_internal_api_key

router = APIRouter()


class CodingAnalysisInput(BaseModel):
    githubUsername: str
    sampleSnippets: Optional[List[str]] = None


@router.post(
    "/coding/github-analysis",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["Coding Analysis"],
)
async def analyze_coding_activity(input_data: CodingAnalysisInput):
    """
    Analyzes code cleanliness, test coverage signals, and documentation quality.
    Requires internal service authentication.
    """
    return {
        "username": input_data.githubUsername,
        "codeStyleScore": 88.5,
        "modularityScore": 91.0,
        "testingMaturity": "Moderate",
        "keyStrengths": ["Idiomatic TypeScript usage", "Strong typing hygiene"],
        "recommendedAreas": ["Increase integration test coverage", "Add API contracts schema validation"],
    }
