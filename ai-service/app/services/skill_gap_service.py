from typing import Dict, List
from app.schemas.skill_gap import (
    SkillGapRequest,
    SkillGapResponse,
    SkillGapRecommendation,
)


class SkillGapService:
    # Role requirements knowledge base
    ROLE_BENCHMARKS: Dict[str, List[str]] = {
        "backend engineer": [
            "python",
            "nodejs",
            "typescript",
            "postgresql",
            "docker",
            "redis",
            "rest api",
            "system design",
            "git",
        ],
        "frontend engineer": [
            "react",
            "typescript",
            "javascript",
            "nextjs",
            "tailwind css",
            "html/css",
            "git",
            "testing",
        ],
        "machine learning engineer": [
            "python",
            "scikit-learn",
            "pandas",
            "numpy",
            "pytorch",
            "fastapi",
            "docker",
            "statistics",
        ],
        "cloud engineer": [
            "kubernetes",
            "docker",
            "linux",
            "terraform",
            "aws",
            "ci/cd",
            "networking",
            "python",
        ],
    }

    def analyze(self, request: SkillGapRequest) -> SkillGapResponse:
        role_key = request.targetRole.lower().strip()
        required_skills = self.ROLE_BENCHMARKS.get(
            role_key,
            ["git", "python", "docker", "databases", "system design", "api design"],
        )

        current_set = {s.lower().strip() for s in request.currentSkills}
        required_set = {s.lower().strip() for s in required_skills}

        existing = list(current_set.intersection(required_set))
        missing = list(required_set.difference(current_set))

        match_pct = round((len(existing) / max(len(required_set), 1)) * 100, 1)

        recommendations: List[SkillGapRecommendation] = []
        for skill in missing:
            recommendations.append(
                SkillGapRecommendation(
                    skill=skill.capitalize(),
                    priority="high" if skill in ["docker", "postgresql", "system design"] else "medium",
                    learningPath=f"Complete foundational exercises and build a capstone project utilizing {skill.capitalize()}.",
                    estimatedTimeToLearn="2 - 3 weeks",
                )
            )

        return SkillGapResponse(
            targetRole=request.targetRole,
            matchPercentage=match_pct,
            existingSkills=[s.capitalize() for s in existing],
            missingSkills=[s.capitalize() for s in missing],
            recommendations=recommendations,
        )


skill_gap_service = SkillGapService()
