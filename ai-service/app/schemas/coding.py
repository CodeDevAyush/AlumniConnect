from typing import List, Optional
from pydantic import BaseModel, Field


class CodingProfileAnalysisRequest(BaseModel):
    studentId: Optional[str] = None
    leetcodeUsername: Optional[str] = None
    codeforcesHandle: Optional[str] = None


class PlatformPerformanceMetric(BaseModel):
    platform: str
    username: str
    verified: bool
    rating: Optional[float] = None
    solvedCount: int
    normalizedScore: float = Field(..., ge=0.0, le=100.0)
    details: dict = Field(default_factory=dict)


class CombinedCodingAnalysisResult(BaseModel):
    studentId: Optional[str] = None
    overallCodingScore: float = Field(..., ge=0.0, le=100.0)
    consistencyRating: str  # Sporadic | Moderate | Highly Consistent
    algorithmicMaturity: str  # Beginner | Intermediate | Advanced | Competitive Master
    platformsAnalyzed: List[PlatformPerformanceMetric]
    keyStrengths: List[str]
    recommendedTopics: List[str]
