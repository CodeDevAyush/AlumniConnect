from typing import List
from pydantic import BaseModel, Field


class SkillGapRequest(BaseModel):
    currentSkills: List[str] = Field(..., min_length=1)
    targetRole: str = Field(..., min_length=2)


class SkillGapRecommendation(BaseModel):
    skill: str
    priority: str  # high, medium, low
    learningPath: str
    estimatedTimeToLearn: str


class SkillGapResponse(BaseModel):
    targetRole: str
    matchPercentage: float
    existingSkills: List[str]
    missingSkills: List[str]
    recommendations: List[SkillGapRecommendation]
