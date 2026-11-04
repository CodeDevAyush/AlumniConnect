from app.schemas.recommendations import (
    CareerRecommendationRequest,
    CareerRecommendationResponse,
    CareerPathStep,
)


class RecommendationService:
    def generate_recommendations(
        self, request: CareerRecommendationRequest
    ) -> CareerRecommendationResponse:
        steps = [
            CareerPathStep(
                stepNumber=1,
                title="Consolidate Distributed Systems & Core Backend",
                description="Master concurrency primitives, transaction isolation levels, and caching strategies.",
                milestone="Build a distributed rate limiter with Redis and Docker.",
                recommendedResources=["Designing Data-Intensive Applications", "Redis Documentation"],
            ),
            CareerPathStep(
                stepNumber=2,
                title="Alumni Mentorship & Architecture Reviews",
                description="Schedule code review and resume sync with verified alumni in target roles.",
                milestone="Conduct 2 mock technical architecture reviews.",
                recommendedResources=["AlumniConnect Mentorship Module", "System Design Primer"],
            ),
            CareerPathStep(
                stepNumber=3,
                title="Targeted Referral Outreach",
                description="Connect with alumni at verified companies for internal referrals.",
                milestone="Submit 3 verified referral applications with tailored portfolios.",
                recommendedResources=["AlumniConnect Referrals Hub"],
            ),
        ]

        readiness = min(len(request.skills) * 15.0, 95.0)

        return CareerRecommendationResponse(
            studentId=request.studentId,
            targetRole=request.targetRole,
            readinessScore=round(readiness, 1),
            recommendedSteps=steps,
        )


recommendation_service = RecommendationService()
