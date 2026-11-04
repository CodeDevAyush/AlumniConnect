from typing import List, Optional
from pydantic import BaseModel, Field


class JobDescriptionAnalysisRequest(BaseModel):
    jobDescriptionText: str = Field(..., min_length=20, description="Raw job description posting text")
    targetRole: Optional[str] = None
    studentId: Optional[str] = None
    studentSkills: Optional[List[str]] = Field(default_factory=list)


class ExtractedJobRequirements(BaseModel):
    jobTitle: str
    experienceLevel: str
    requiredSkills: List[str]
    preferredSkills: List[str]
    toolsAndFrameworks: List[str]
    coreConcepts: List[str]


class PrioritizedSkillAction(BaseModel):
    skill: str
    priority: str  # HIGH | MEDIUM | LOW
    reason: str
    recommendedLearningAction: str
    suggestedProjectIdea: str
    estimatedWeeksToAcquire: int


class SkillGapComparisonResult(BaseModel):
    targetRole: str
    jobTitle: str
    matchPercentage: float = Field(..., ge=0.0, le=100.0)
    demonstratedSkills: List[str]
    skillsNeedingImprovement: List[str]
    skillsWithoutEvidence: List[str]
    prioritizedRoadmap: List[PrioritizedSkillAction]
    executiveSummary: str
