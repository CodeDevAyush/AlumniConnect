from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class DimensionScore(BaseModel):
    category: str
    score: float = Field(..., ge=0.0, le=100.0)
    confidence: str = Field(..., description="INSUFFICIENT | LOW | MODERATE | HIGH | VERIFIED")
    hasEvidence: bool
    evidenceSources: List[str]
    insights: str


class StudentEvidencePayload(BaseModel):
    studentId: str
    selectedTrack: str = Field(default="SDE", description="One of: SDE, FRONTEND, BACKEND, FULLSTACK, AIML, DATA_ANALYST, DATA_ENGINEER, COMPETITIVE_PROGRAMMER")
    leetcodeUsername: Optional[str] = None
    codeforcesHandle: Optional[str] = None
    githubUsername: Optional[str] = None
    selfReportedSkills: List[str] = Field(default_factory=list)
    internalAssessments: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    manualProjects: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class CapabilityAssessmentResult(BaseModel):
    studentId: str
    track: str
    trackTitle: str
    overallCapabilityScore: float = Field(..., ge=0.0, le=100.0)
    readinessTier: str
    overallConfidence: str
    dimensionScores: Dict[str, DimensionScore]
    missingEvidenceNotices: List[str]
    strengths: List[str]
    improvementAreas: List[str]
    assessmentVersion: str = "v1.0.0"
    evaluatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
