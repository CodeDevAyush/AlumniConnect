import logging
from typing import List
from app.integrations.coding_platforms_client import coding_client
from app.schemas.coding import (
    CodingProfileAnalysisRequest,
    CombinedCodingAnalysisResult,
    PlatformPerformanceMetric,
)

logger = logging.getLogger("coding_analysis")


class CodingAnalysisService:
    """Evaluates cross-platform coding metrics and calculates normalized performance."""

    async def analyze(
        self, request: CodingProfileAnalysisRequest
    ) -> CombinedCodingAnalysisResult:
        metrics: List[PlatformPerformanceMetric] = []
        scores: List[float] = []

        # 1. Evaluate Codeforces
        if request.codeforcesHandle:
            cf_data = await coding_client.fetch_codeforces_data(request.codeforcesHandle)
            if cf_data:
                metrics.append(
                    PlatformPerformanceMetric(
                        platform="Codeforces",
                        username=request.codeforcesHandle,
                        verified=True,
                        rating=cf_data.get("rating"),
                        solvedCount=cf_data.get("solvedCount", 0),
                        normalizedScore=cf_data.get("normalizedScore", 0.0),
                        details={
                            "rank": cf_data.get("rank"),
                            "topTags": cf_data.get("topProblemTags", []),
                        },
                    )
                )
                scores.append(cf_data.get("normalizedScore", 0.0))

        # 2. Evaluate LeetCode
        if request.leetcodeUsername:
            lc_data = await coding_client.fetch_leetcode_data(request.leetcodeUsername)
            if lc_data:
                metrics.append(
                    PlatformPerformanceMetric(
                        platform="LeetCode",
                        username=request.leetcodeUsername,
                        verified=True,
                        rating=lc_data.get("contestRating"),
                        solvedCount=lc_data.get("totalSolved", 0),
                        normalizedScore=lc_data.get("normalizedScore", 0.0),
                        details={
                            "easy": lc_data.get("easySolved", 0),
                            "medium": lc_data.get("mediumSolved", 0),
                            "hard": lc_data.get("hardSolved", 0),
                            "topPercentage": lc_data.get("topPercentage"),
                        },
                    )
                )
                scores.append(lc_data.get("normalizedScore", 0.0))

        if not scores:
            # Baseline when handles are provided but not yet verified or active
            overall = 0.0
            maturity = "Insufficient Evidence"
            consistency = "No Recorded Submissions"
            strengths = ["Profiles linked; await verification/first crawl"]
            topics = ["Arrays & Hashing", "Two Pointers", "Binary Search"]
        else:
            overall = round(sum(scores) / len(scores), 1)
            if overall >= 80:
                maturity = "Advanced / Competitive"
                consistency = "Highly Consistent"
            elif overall >= 60:
                maturity = "Intermediate"
                consistency = "Moderate"
            else:
                maturity = "Developing Foundation"
                consistency = "Sporadic"

            strengths = [
                f"Multi-platform coding evidence across {len(metrics)} platform(s)",
                "Solid algorithmic problem volume and structured practice",
            ]
            topics = ["Dynamic Programming", "Graph Traversals (BFS/DFS)", "Systematic Space Optimization"]

        return CombinedCodingAnalysisResult(
            studentId=request.studentId,
            overallCodingScore=overall,
            consistencyRating=consistency,
            algorithmicMaturity=maturity,
            platformsAnalyzed=metrics,
            keyStrengths=strengths,
            recommendedTopics=topics,
        )


coding_analysis_service = CodingAnalysisService()

