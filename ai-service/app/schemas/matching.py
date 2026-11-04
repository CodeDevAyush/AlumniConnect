from typing import List, Optional
from pydantic import BaseModel, Field


class AlumniCandidate(BaseModel):
    id: str
    name: str
    company: str
    title: str
    skills: List[str]
    industry: Optional[str] = None
    yearsOfExperience: Optional[int] = 0
    willingToMentor: bool = True
    willingToRefer: bool = True


class AlumniMatchRequest(BaseModel):
    studentId: str
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    targetRoles: List[str] = Field(default_factory=list)
    candidates: Optional[List[AlumniCandidate]] = None
    topK: int = Field(default=5, ge=1, le=50)


class MatchScoreResult(BaseModel):
    alumniId: str
    score: float = Field(..., ge=0.0, le=1.0)
    matchedSkills: List[str]
    missingSkills: List[str]
    rationale: str


class AlumniMatchResponse(BaseModel):
    studentId: str
    totalEvaluated: int
    matches: List[MatchScoreResult]
