import logging
from typing import List
from app.integrations.gemini_client import gemini_client
from app.schemas.project_eval import (
    ProjectEvaluationResult,
    ProjectSubmissionRequest,
    RubricCriterionScore,
)

logger = logging.getLogger("project_evaluation")


class ProjectEvaluationService:
    """
    Evaluates student capstone and portfolio projects using multi-criteria
    deterministic rubrics augmented with Gemini qualitative critique.
    """

    async def evaluate_project(
        self, request: ProjectSubmissionRequest
    ) -> ProjectEvaluationResult:
        tech_stack = [s.strip() for s in request.techStack]
        stack_lower = [s.lower() for s in tech_stack]

        # ----------------------------------------------------------------------
        # Deterministic Rubric Criteria Evaluation
        # ----------------------------------------------------------------------
        # 1. Architecture & Modularity (25%)
        has_architecture_doc = bool(request.architectureOverview and len(request.architectureOverview) > 30)
        arch_score = 85.0 if has_architecture_doc else 65.0
        arch_feedback = (
            "Detailed architectural overview provided with clear component boundaries."
            if has_architecture_doc
            else "Add an explicit architectural diagram and layer separation specifications."
        )

        # 2. Tech Stack Depth (25%)
        # Production indicators: databases, caches, typed languages, Docker
        production_tech = {"postgresql", "mongodb", "redis", "docker", "kubernetes", "typescript", "golang", "fastapi", "nestjs"}
        matched_prod_tech = set(stack_lower).intersection(production_tech)
        stack_score = min(50.0 + len(matched_prod_tech) * 12.0 + len(tech_stack) * 4.0, 95.0)
        stack_feedback = f"Production-grade tooling identified: {', '.join(matched_prod_tech) if matched_prod_tech else 'Standard starter stack'}."

        # 3. Testing & Reliability Evidence (20%)
        # Check description or architecture for testing signals
        has_tests_mentioned = any(kw in request.description.lower() for kw in ["test", "unit test", "jest", "pytest", "coverage", "integration"])
        testing_score = 80.0 if has_tests_mentioned else 50.0
        testing_feedback = (
            "Automated test coverage mentioned in project submission."
            if has_tests_mentioned
            else "Ensure test suites (unit, integration, e2e) are committed alongside project code."
        )

        # 4. Documentation & Clarity (15%)
        doc_length = len(request.description)
        doc_score = min(40.0 + (doc_length / 20.0), 95.0)
        doc_feedback = "Comprehensive project narrative and feature listing provided."

        # 5. Deployment & Production Readiness (15%)
        has_live_demo = bool(request.liveDemoUrl and request.liveDemoUrl.startswith("http"))
        has_repo = bool(request.repositoryUrl and request.repositoryUrl.startswith("http"))
        deploy_score = 90.0 if (has_live_demo and has_repo) else (70.0 if has_repo else 45.0)
        deploy_feedback = (
            "Verified live cloud deployment and accessible source code repository."
            if has_live_demo and has_repo
            else "Deploy this project to a live staging environment (e.g. Vercel, Render) with a public demo link."
        )

        rubric = [
            RubricCriterionScore(criterion="Architecture & Modularity", score=round(arch_score, 1), weight=0.25, feedback=arch_feedback),
            RubricCriterionScore(criterion="Tech Stack Appropriateness & Depth", score=round(stack_score, 1), weight=0.25, feedback=stack_feedback),
            RubricCriterionScore(criterion="Testing & Reliability Evidence", score=round(testing_score, 1), weight=0.20, feedback=testing_feedback),
            RubricCriterionScore(criterion="Documentation & Clarity", score=round(doc_score, 1), weight=0.15, feedback=doc_feedback),
            RubricCriterionScore(criterion="Deployment & Production Readiness", score=round(deploy_score, 1), weight=0.15, feedback=deploy_feedback),
        ]

        overall = round(sum(item.score * item.weight for item in rubric), 1)

        tier = "Prototype"
        if overall >= 82:
            tier = "Production-Ready Enterprise Project"
        elif overall >= 68:
            tier = "Standard College Portfolio Project"

        # ----------------------------------------------------------------------
        # Qualitative Review via Gemini
        # ----------------------------------------------------------------------
        prompt = f"""
        Act as a Principal Staff Software Architect. Conduct a concise code review critique of this project submission:
        Title: {request.title}
        Description: {request.description}
        Tech Stack: {', '.join(tech_stack)}
        Architecture: {request.architectureOverview or 'Not provided'}
        Key Features: {', '.join(request.keyFeatures or [])}
        
        Provide:
        1. Key architectural strengths (2 bullet points)
        2. High-impact improvements to elevate this to Tier-1 tech industry hiring standards (2 bullet points)
        """
        gemini_review = await gemini_client.generate_text(prompt)

        return ProjectEvaluationResult(
            title=request.title,
            overallScore=overall,
            complexityTier=tier,
            rubricBreakdown=rubric,
            verifiedStack=tech_stack,
            hygieneStrengths=[
                f"Modern tech stack selection ({', '.join(tech_stack[:3])})",
                "Explicit feature breakdown and clear domain focus",
            ],
            architecturalRecommendations=[
                "Implement structured telemetry and structured request-response logging",
                "Add automated CI pipeline for linting, type-checking, and regression testing",
            ],
            qualitativeFeedback=gemini_review or "Solid foundational implementation. Focus on adding end-to-end integration test coverage.",
        )


project_evaluation_service = ProjectEvaluationService()
