from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ProjectQualityCheckRequest(BaseModel):
    repoUrl: Optional[str] = Field(None, description="GitHub repository full URL or owner/repo format")
    repoName: Optional[str] = Field(None, description="Repository name if known")
    studentId: Optional[str] = Field(None, description="Optional ID of candidate")
    targetTrack: Optional[str] = Field("FULLSTACK", description="Target technical track")


class SonarMetrics(BaseModel):
    qualityGate: str = Field("PASSED", description="PASSED, WARNING, or FAILED")
    reliabilityRating: str = Field("A", description="A through E")
    securityRating: str = Field("A", description="A through E")
    maintainabilityRating: str = Field("A", description="A through E")
    bugsCount: int = 0
    vulnerabilitiesCount: int = 0
    securityHotspots: int = 0
    codeSmells: int = 0
    technicalDebtMinutes: int = 0
    duplicatedLinesDensity: float = 0.0
    estimatedCoverage: float = 0.0


class SemgrepFinding(BaseModel):
    checkId: str
    severity: str  # ERROR, WARNING, INFO
    message: str
    filePath: Optional[str] = None
    line: Optional[int] = None
    category: str = "security"  # security, correctness, maintainability


class ProjectQualityCheckResult(BaseModel):
    repository: str
    owner: str
    repoName: str
    primaryLanguage: str
    stars: int = 0
    forks: int = 0
    openIssues: int = 0
    overallQualityScore: float = Field(..., ge=0.0, le=100.0)
    qualityGrade: str = "A"
    complexityTier: str = "Production-Ready"
    sonarMetrics: SonarMetrics
    semgrepFindings: List[SemgrepFinding] = []
    engineeringHygiene: Dict[str, Any] = {}
    keyStrengths: List[str] = []
    criticalVulnerabilities: List[str] = []
    architecturalRecommendations: List[str] = []
    aiSummary: str = ""

