from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectSubmissionRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=15)
    techStack: List[str] = Field(..., min_items=1)
    repositoryUrl: Optional[str] = None
    liveDemoUrl: Optional[str] = None
    architectureOverview: Optional[str] = None
    keyFeatures: Optional[List[str]] = Field(default_factory=list)


class RubricCriterionScore(BaseModel):
    criterion: str
    score: float = Field(..., ge=0.0, le=100.0)
    weight: float
    feedback: str


class ProjectEvaluationResult(BaseModel):
    title: str
    overallScore: float = Field(..., ge=0.0, le=100.0)
    complexityTier: str  # Prototype | Standard College Project | Production-Ready
    rubricBreakdown: List[RubricCriterionScore]
    verifiedStack: List[str]
    hygieneStrengths: List[str]
    architecturalRecommendations: List[str]
    qualitativeFeedback: str

