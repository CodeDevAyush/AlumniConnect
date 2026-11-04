from typing import List, Dict
from pydantic import BaseModel, Field


class CapabilityAssessmentRequest(BaseModel):
    studentId: str
    skills: List[str]
    projectsCount: int = Field(default=0, ge=0)
    contributionsCount: int = Field(default=0, ge=0)
    interviewRating: float = Field(default=0.0, ge=0.0, le=5.0)


class CapabilityScoreBreakdown(BaseModel):
    category: str
    score: float
    maxScore: float = 100.0
    insights: str


class CapabilityAssessmentResponse(BaseModel):
    studentId: str
    overallScore: float
    readinessTier: str  # Beginner, Developing, Industry Ready, Advanced
    breakdown: List[CapabilityScoreBreakdown]
    strengths: List[str]
    improvementAreas: List[str]
