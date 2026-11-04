import logging
from typing import Any, Dict, List, Optional
from app.integrations.github_client import github_client

logger = logging.getLogger("github_analysis")


class GitHubAnalysisService:
    """Analyzes student GitHub development profiles and project engineering hygiene."""

    async def analyze_student_github(self, username: str) -> Dict[str, Any]:
        if not username:
            return {
                "hasEvidence": False,
                "message": "No GitHub profile username provided",
                "developmentCapabilityScore": 0.0,
            }

        evidence = await github_client.aggregate_student_github_evidence(username)
        if not evidence.get("verified"):
            return {
                "hasEvidence": False,
                "username": username,
                "message": evidence.get("reason", "Inaccessible GitHub profile"),
                "developmentCapabilityScore": 0.0,
            }

        # Calculate Development Capability Score (0-100)
        # Components:
        # 1. Engineering Hygiene Score (40%)
        # 2. Original Repo Breadth (capped at 5 repos -> 30%)
        # 3. Community Validation / Stars (capped at 15 stars -> 15%)
        # 4. Language Diversity (capped at 3 production languages -> 15%)
        hygiene_part = evidence.get("averageEngineeringHygieneScore", 30.0) * 0.40
        repos_part = min(evidence.get("originalReposAnalyzed", 0) / 4.0, 1.0) * 30.0
        stars_part = min(evidence.get("totalStars", 0) / 10.0, 1.0) * 15.0
        langs_part = min(len(evidence.get("primaryLanguages", [])) / 3.0, 1.0) * 15.0

        dev_score = round(hygiene_part + repos_part + stars_part + langs_part, 1)

        return {
            "hasEvidence": True,
            "username": username,
            "developmentCapabilityScore": dev_score,
            "evidence": evidence,
            "hygieneScore": evidence.get("averageEngineeringHygieneScore"),
            "languages": evidence.get("primaryLanguages", []),
            "insights": f"Analyzed {evidence.get('originalReposAnalyzed')} original repos. Engineering hygiene: {evidence.get('averageEngineeringHygieneScore')}/100.",
        }


github_analysis_service = GitHubAnalysisService()

