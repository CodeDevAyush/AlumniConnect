from typing import List
from pydantic import BaseModel


class CareerRecommendationRequest(BaseModel):
    studentId: str
    skills: List[str]
    targetRole: str
    currentYear: int = 3


class CareerPathStep(BaseModel):
    stepNumber: int
    title: str
    description: str
    milestone: str
    recommendedResources: List[str]


class CareerRecommendationResponse(BaseModel):
    studentId: str
    targetRole: str
    readinessScore: float
    recommendedSteps: List[CareerPathStep]
