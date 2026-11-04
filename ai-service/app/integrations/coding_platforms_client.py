import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger("coding_platforms")


class CodingPlatformsClient:
    """Client for gathering verified coding performance data from Codeforces and LeetCode."""

    CODEFORCES_BASE = "https://codeforces.com/api"
    LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

    def __init__(self):
        self.timeout = httpx.Timeout(15.0, connect=5.0)

    # --------------------------------------------------------------------------
    # 1. CODEFORCES INTEGRATION
    # --------------------------------------------------------------------------
    async def fetch_codeforces_data(self, handle: str) -> Optional[Dict[str, Any]]:
        """Queries the official Codeforces public API for rating and submissions."""
        if not handle:
            return None

        user_info_url = f"{self.CODEFORCES_BASE}/user.info?handles={handle}"
        submissions_url = f"{self.CODEFORCES_BASE}/user.status?handle={handle}&from=1&count=200"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                info_res = await client.get(user_info_url)
                if info_res.status_code != 200:
                    logger.warning(f"Codeforces user info lookup failed for {handle}")
                    return None

                info_data = info_res.json()
                if info_data.get("status") != "OK" or not info_data.get("result"):
                    return None

                user_meta = info_data["result"][0]

                # Fetch submissions
                sub_res = await client.get(submissions_url)
                solved_problems = set()
                tag_frequency: Dict[str, int] = {}

                if sub_res.status_code == 200:
                    sub_data = sub_res.json()
                    if sub_data.get("status") == "OK":
                        for sub in sub_data.get("result", []):
                            if sub.get("verdict") == "OK":
                                prob = sub.get("problem", {})
                                prob_id = f"{prob.get('contestId')}-{prob.get('index')}"
                                solved_problems.add(prob_id)
                                for tag in prob.get("tags", []):
                                    tag_frequency[tag] = tag_frequency.get(tag, 0) + 1

                rating = user_meta.get("rating", 0)
                max_rating = user_meta.get("maxRating", 0)
                rank = user_meta.get("rank", "unrated")

                # Normalize Codeforces performance to a 0-100 scale:
                # 1200 = ~50, 1400 = ~65, 1600 = ~78, 1900 = ~90, 2100+ = 98+
                normalized_score = min(max(round((rating / 2100.0) * 100.0, 1), 0.0), 100.0)

                return {
                    "platform": "Codeforces",
                    "handle": handle,
                    "verified": True,
                    "rating": rating,
                    "maxRating": max_rating,
                    "rank": rank,
                    "solvedCount": len(solved_problems),
                    "normalizedScore": normalized_score,
                    "topProblemTags": sorted(
                        tag_frequency.keys(),
                        key=lambda k: tag_frequency[k],
                        reverse=True,
                    )[:6],
                }

        except Exception as e:
            logger.error(f"Error querying Codeforces for {handle}: {e}")
            return None

    # --------------------------------------------------------------------------
    # 2. LEETCODE INTEGRATION
    # --------------------------------------------------------------------------
    async def fetch_leetcode_data(self, username: str) -> Optional[Dict[str, Any]]:
        """Queries LeetCode public GraphQL endpoint for problem breakdown & contest metrics."""
        if not username:
            return None

        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
            userContestRanking(username: $username) {
                rating
                globalRanking
                totalParticipants
                topPercentage
            }
        }
        """

        headers = {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    self.LEETCODE_GRAPHQL,
                    json={"query": query, "variables": {"username": username}},
                    headers=headers,
                )
                if res.status_code != 200:
                    logger.warning(f"LeetCode GraphQL query returned {res.status_code} for {username}")
                    return None

                data = res.json().get("data", {})
                matched_user = data.get("matchedUser")
                if not matched_user:
                    return None

                # Extract difficulty breakdown
                sub_stats = (
                    matched_user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
                )
                breakdown = {"Easy": 0, "Medium": 0, "Hard": 0, "All": 0}
                for item in sub_stats:
                    diff = item.get("difficulty")
                    if diff in breakdown:
                        breakdown[diff] = item.get("count", 0)

                contest = data.get("userContestRanking") or {}
                contest_rating = contest.get("rating", 0)

                # Weighted problem-solving score
                # Easy=1, Medium=3, Hard=6
                weighted_sum = (
                    (breakdown["Easy"] * 1.0)
                    + (breakdown["Medium"] * 3.0)
                    + (breakdown["Hard"] * 6.0)
                )
                # Benchmark: 150 Med + 30 Hard = ~630 weighted points -> normalized ~80
                normalized_score = min(round((weighted_sum / 750.0) * 100.0, 1), 100.0)

                return {
                    "platform": "LeetCode",
                    "username": username,
                    "verified": True,
                    "totalSolved": breakdown["All"],
                    "easySolved": breakdown["Easy"],
                    "mediumSolved": breakdown["Medium"],
                    "hardSolved": breakdown["Hard"],
                    "contestRating": round(contest_rating, 1) if contest_rating else None,
                    "topPercentage": contest.get("topPercentage"),
                    "normalizedScore": normalized_score,
                }

        except Exception as e:
            logger.error(f"Error querying LeetCode for {username}: {e}")
            return None


coding_client = CodingPlatformsClient()
