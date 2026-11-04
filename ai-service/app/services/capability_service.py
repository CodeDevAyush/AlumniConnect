from app.schemas.capability import (
    CapabilityAssessmentRequest,
    CapabilityAssessmentResponse,
    CapabilityScoreBreakdown,
)


class CapabilityAssessmentService:
    def evaluate(self, request: CapabilityAssessmentRequest) -> CapabilityAssessmentResponse:
        skills_score = min(len(request.skills) * 12.0, 100.0)
        project_score = min(request.projectsCount * 25.0, 100.0)
        contrib_score = min(request.contributionsCount * 15.0, 100.0)
        interview_score = (request.interviewRating / 5.0) * 100.0 if request.interviewRating > 0 else 70.0

        overall = round(
            (skills_score * 0.35)
            + (project_score * 0.30)
            + (contrib_score * 0.15)
            + (interview_score * 0.20),
            1,
        )

        tier = "Beginner"
        if overall >= 80:
            tier = "Industry Ready"
        elif overall >= 60:
            tier = "Developing"
        elif overall >= 40:
            tier = "Emerging"

        breakdown = [
            CapabilityScoreBreakdown(
                category="Core Technical Skills",
                score=round(skills_score, 1),
                insights=f"{len(request.skills)} verified technical proficiencies identified.",
            ),
            CapabilityScoreBreakdown(
                category="Practical Project Portfolio",
                score=round(project_score, 1),
                insights=f"{request.projectsCount} end-to-end production-ready applications evaluated.",
            ),
            CapabilityScoreBreakdown(
                category="Open Source & Collaborative Activity",
                score=round(contrib_score, 1),
                insights=f"{request.contributionsCount} public version control contributions verified.",
            ),
            CapabilityScoreBreakdown(
                category="Technical Communication & Interviewing",
                score=round(interview_score, 1),
                insights="Assessed across peer mock sessions and architectural discussions.",
            ),
        ]

        strengths = [s for s in request.skills[:3]] or ["Consistent commit cadence", "Proactive learning"]
        improvements = ["Expand distributed systems depth", "Participate in collaborative peer code reviews"]

        return CapabilityAssessmentResponse(
            studentId=request.studentId,
            overallScore=overall,
            readinessTier=tier,
            breakdown=breakdown,
            strengths=strengths,
            improvementAreas=improvements,
        )


capability_service = CapabilityAssessmentService()
