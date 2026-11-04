import httpx
from typing import Dict, Any, List
from app.core.config import settings


class GitHubClient:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AlumniConnect-AI-Engine",
        }
        if settings.GITHUB_PERSONAL_ACCESS_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_PERSONAL_ACCESS_TOKEN}"

    async def get_user_repositories(self, username: str) -> List[Dict[str, Any]]:
        """Fetch public repositories for student/alumni portfolio evaluation."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/users/{username}/repos?sort=updated&per_page=10",
                    headers=self.headers,
                )
                if response.status_code == 200:
                    return response.json()
                return []
            except Exception:
                return []

    async def evaluate_github_profile(self, username: str) -> Dict[str, Any]:
        """Aggregate signals including language distribution and repo activity."""
        repos = await self.get_user_repositories(username)
        languages: Dict[str, int] = {}
        total_stars = 0

        for r in repos:
            lang = r.get("language")
            if lang:
                languages[lang] = languages.get(lang, 0) + 1
            total_stars += r.get("stargazers_count", 0)

        return {
            "username": username,
            "publicRepoCount": len(repos),
            "primaryLanguages": sorted(languages.keys(), key=lambda k: languages[k], reverse=True)[:5],
            "totalStarsEarned": total_stars,
            "portfolioVerified": len(repos) > 0,
        }


github_client = GitHubClient()
