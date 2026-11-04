import base64
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("github_client")


class GitHubClient:
    """Production GitHub client leveraging GitHub REST API v3 with authentication."""

    BASE_URL = "https://api.github.com"

    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AlumniConnect-Intelligence-Subsystem",
        }
        if settings.GITHUB_PERSONAL_ACCESS_TOKEN:
            self.headers["Authorization"] = f"token {settings.GITHUB_PERSONAL_ACCESS_TOKEN}"
        self.timeout = httpx.Timeout(15.0, connect=5.0)

    async def get_user_profile(self, username: str) -> Optional[Dict[str, Any]]:
        """Fetches public user profile information."""
        url = f"{self.BASE_URL}/users/{username}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    return res.json()
                logger.warning(f"GitHub user {username} lookup returned {res.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching GitHub user {username}: {e}")
            return None

    async def get_repositories(self, username: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetches public non-forked repositories sorted by latest update."""
        url = f"{self.BASE_URL}/users/{username}/repos?sort=updated&per_page={limit}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    repos = res.json()
                    # Filter out purely forked repos to focus on student's original code
                    return [r for r in repos if not r.get("fork", False)]
                return []
        except Exception as e:
            logger.error(f"Error fetching repos for {username}: {e}")
            return []

    async def get_repository_languages(self, username: str, repo_name: str) -> Dict[str, int]:
        """Fetches language byte distribution for a repository."""
        url = f"{self.BASE_URL}/repos/{username}/{repo_name}/languages"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    return res.json()
                return {}
        except Exception as e:
            logger.error(f"Error fetching languages for {username}/{repo_name}: {e}")
            return {}

    async def get_repository_readme(self, username: str, repo_name: str) -> Optional[str]:
        """Fetches and decodes the repository README."""
        url = f"{self.BASE_URL}/repos/{username}/{repo_name}/readme"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
                    content_b64 = data.get("content", "")
                    if content_b64:
                        return base64.b64decode(content_b64).decode("utf-8", errors="ignore")
                return None
        except Exception as e:
            logger.debug(f"README not found or error for {username}/{repo_name}: {e}")
            return None

    async def inspect_repository_structure(
        self, username: str, repo_name: str
    ) -> Dict[str, Any]:
        """Inspects root directory tree for software engineering hygiene indicators."""
        url = f"{self.BASE_URL}/repos/{username}/{repo_name}/contents"
        indicators = {
            "has_tests": False,
            "has_ci": False,
            "has_docker": False,
            "has_docs": False,
            "has_license": False,
            "top_level_files": [],
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code != 200:
                    return indicators

                items = res.json()
                if not isinstance(items, list):
                    return indicators

                filenames = [item.get("name", "").lower() for item in items]
                indicators["top_level_files"] = filenames

                # Test directories or test files
                indicators["has_tests"] = any(
                    name in ["test", "tests", "__tests__", "spec", "test.py", "test.js"]
                    or name.endswith(".test.ts")
                    or name.endswith(".spec.ts")
                    for name in filenames
                )
                indicators["has_docker"] = any(
                    name in ["dockerfile", "docker-compose.yml", "docker-compose.yaml"]
                    for name in filenames
                )
                indicators["has_docs"] = any(
                    name in ["docs", "documentation", "readme.md", "architecture.md"]
                    for name in filenames
                )
                indicators["has_license"] = any(
                    "license" in name for name in filenames
                )
                indicators["has_ci"] = ".github" in filenames

                return indicators
        except Exception as e:
            logger.error(f"Error inspecting contents for {username}/{repo_name}: {e}")
            return indicators

    async def aggregate_student_github_evidence(
        self, username: str
    ) -> Dict[str, Any]:
        """
        Gathers complete GitHub evidence: profile metrics, primary languages,
        testing hygiene, and architecture signals.
        """
        profile = await self.get_user_profile(username)
        if not profile:
            return {"verified": False, "username": username, "reason": "User not found or inaccessible"}

        repos = await self.get_repositories(username, limit=10)
        language_aggregation: Dict[str, int] = {}
        total_stars = 0
        total_forks = 0
        hygiene_scores: List[float] = []

        for r in repos[:6]:  # Inspect top 6 repositories deeply
            name = r.get("name", "")
            total_stars += r.get("stargazers_count", 0)
            total_forks += r.get("forks_count", 0)

            langs = await self.get_repository_languages(username, name)
            for lang, bytes_count in langs.items():
                language_aggregation[lang] = language_aggregation.get(lang, 0) + bytes_count

            structure = await self.inspect_repository_structure(username, name)
            # Compute a 0-100 repo hygiene score based on engineering signals
            score = 20.0  # Base for having a valid original repo
            if structure.get("has_tests"):
                score += 30.0
            if structure.get("has_ci"):
                score += 20.0
            if structure.get("has_docker"):
                score += 15.0
            if structure.get("has_docs"):
                score += 15.0
            hygiene_scores.append(score)

        avg_hygiene = round(sum(hygiene_scores) / max(len(hygiene_scores), 1), 1)

        # Sort languages by volume
        sorted_languages = sorted(
            language_aggregation.keys(),
            key=lambda k: language_aggregation[k],
            reverse=True,
        )

        return {
            "verified": True,
            "username": username,
            "name": profile.get("name") or username,
            "bio": profile.get("bio") or "",
            "publicReposCount": profile.get("public_repos", 0),
            "originalReposAnalyzed": len(repos),
            "totalStars": total_stars,
            "totalForks": total_forks,
            "primaryLanguages": sorted_languages[:5],
            "averageEngineeringHygieneScore": avg_hygiene,
            "topRepositories": [
                {
                    "name": r.get("name"),
                    "description": r.get("description"),
                    "stars": r.get("stargazers_count"),
                    "language": r.get("language"),
                    "updatedAt": r.get("updated_at"),
                    "url": r.get("html_url"),
                }
                for r in repos[:5]
            ],
        }


github_client = GitHubClient()
