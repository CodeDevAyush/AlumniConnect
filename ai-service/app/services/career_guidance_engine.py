import logging
from typing import List
from app.integrations.gemini_client import gemini_client
from app.schemas.recommendations import (
    CareerPathStep,
    CareerRecommendationRequest,
    CareerRecommendationResponse,
)

logger = logging.getLogger("career_guidance")


class CareerGuidanceEngine:
    """
    Synthesizes student capability profiles into personalized,
    milestone-driven career preparation plans.
    """

    async def generate_guidance(
        self, request: CareerRecommendationRequest
    ) -> CareerRecommendationResponse:
        skills_str = ", ".join(request.skills) if request.skills else "Foundational CS"

        # Deterministic Base Pathway
        base_steps = [
            CareerPathStep(
                stepNumber=1,
                title="Consolidate Core Track Competencies",
                description=f"Strengthen deep architectural patterns for {request.targetRole}. Focus on scalable data modeling and latency optimization.",
                milestone="Build a production-grade service featuring transactional persistence, Redis caching, and CI/CD automation.",
                recommendedResources=["Designing Data-Intensive Applications", "Production Go / TypeScript Handbooks"],
            ),
            CareerPathStep(
                stepNumber=2,
                title="Targeted Alumni Mentorship & Architecture Reviews",
                description="Engage with alumni mentors in your track to review your project codebases, resume layout, and technical communication.",
                milestone="Complete 2 structured mock system architecture interviews with verified alumni.",
                recommendedResources=["AlumniConnect Mentorship Module", "System Design Primer"],
            ),
            CareerPathStep(
                stepNumber=3,
                title="Verified Referral Outreach & Technical Submission",
                description="Leverage AlumniConnect's referral pipeline for early-access internship and full-time hiring pools.",
                milestone="Submit tailored portfolios and secure 3 internal employee referrals.",
                recommendedResources=["AlumniConnect Referral Hub", "Tech Interview Handbook"],
            ),
        ]

        # Use Gemini to generate dynamic custom guidance narrative if configured
        prompt = f"""
        Act as an Executive Tech Career Coach. A university student in year {request.currentYear} is preparing for a career as a {request.targetRole}.
        Current Skills: {skills_str}
        
        Provide 3 specific, evidence-grounded action items:
        1. Exact technical project to build
        2. Exact algorithmic/system topic to master
        3. Strategic alumni outreach recommendation
        """
        gemini_advice = await gemini_client.generate_text(prompt)

        readiness = min(len(request.skills) * 12.0 + 35.0, 95.0)

        return CareerRecommendationResponse(
            studentId=request.studentId,
            targetRole=request.targetRole,
            readinessScore=round(readiness, 1),
            recommendedSteps=base_steps,
        )


career_guidance_engine = CareerGuidanceEngine()
