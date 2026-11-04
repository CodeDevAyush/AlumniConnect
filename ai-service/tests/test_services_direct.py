import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.capability import StudentEvidencePayload
from app.services.capability_engine import capability_engine
from app.schemas.skill_gap import JobDescriptionAnalysisRequest
from app.services.skill_gap_engine import skill_gap_engine
from app.schemas.project_eval import ProjectSubmissionRequest
from app.services.project_evaluation_service import project_evaluation_service
from app.schemas.matching import AlumniMatchRequest
from app.services.matching_engine import matching_engine
from app.schemas.recommendations import CareerRecommendationRequest
from app.services.career_guidance_engine import career_guidance_engine


async def run_diagnostics():
    print("=== Starting direct services test suite ===")

    # 1. Test Capability Assessment Engine
    print("\n--- 1. Testing Capability Assessment Engine ---")
    payload = StudentEvidencePayload(
        studentId="student-test-alex",
        selectedTrack="BACKEND",
        selfReportedSkills=["TypeScript", "NestJS", "PostgreSQL", "Docker", "Redis"],
        internalAssessments=[{"subject": "Distributed Systems", "score": 88}],
        manualProjects=[
            {
                "title": "AlumniConnect Platform",
                "techStack": ["TypeScript", "NestJS", "PostgreSQL", "Docker"],
            }
        ],
    )
    cap_result = await capability_engine.evaluate(payload)
    print(f"[OK] Track: {cap_result.trackTitle}")
    print(f"[OK] Overall Capability Score: {cap_result.overallCapabilityScore}/100")
    print(f"[OK] Readiness Tier: {cap_result.readinessTier}")
    print(f"[OK] Evidence Confidence: {cap_result.overallConfidence}")
    print(f"[OK] Missing Evidence Notices: {cap_result.missingEvidenceNotices}")
    assert cap_result.overallCapabilityScore > 40.0
    assert len(cap_result.dimensionScores) == 5

    # 2. Test Skill Gap Engine (Deterministic fallback path)
    print("\n--- 2. Testing Skill Gap Engine ---")
    sg_payload = JobDescriptionAnalysisRequest(
        jobDescriptionText="Seeking a Senior Backend Engineer proficient in Python, PostgreSQL, Docker, and Kubernetes for distributed systems.",
        targetRole="Backend Engineer",
        studentSkills=["Python", "PostgreSQL", "Docker"],
    )
    extracted = await skill_gap_engine.extract_job_requirements(sg_payload.jobDescriptionText)
    print(f"[OK] Extracted Job Requirements: {extracted.get('jobTitle')} - {extracted.get('requiredSkills')}")
    sg_result = await skill_gap_engine.analyze_gap(sg_payload)
    print(f"[OK] Match Percentage: {sg_result.matchPercentage}%")
    print(f"[OK] Demonstrated Skills: {sg_result.demonstratedSkills}")
    print(f"[OK] Prioritized Roadmap: {len(sg_result.prioritizedRoadmap)} action items")
    assert sg_result.matchPercentage > 0

    # 3. Test Project Evaluation Service
    print("\n--- 3. Testing Project Evaluation Service ---")
    proj_payload = ProjectSubmissionRequest(
        title="Distributed Task Queue",
        description="A high-throughput distributed task scheduler built with TypeScript, Redis, and PostgreSQL with full unit and integration test suites.",
        techStack=["TypeScript", "Redis", "PostgreSQL", "Docker"],
        repositoryUrl="https://github.com/example/task-queue",
        liveDemoUrl="https://taskqueue.example.com",
        architectureOverview="Microservice architecture separating worker consumers from the job ingestor API.",
    )
    proj_result = await project_evaluation_service.evaluate_project(proj_payload)
    print(f"[OK] Project: {proj_result.title}")
    print(f"[OK] Overall Score: {proj_result.overallScore}/100")
    print(f"[OK] Complexity Tier: {proj_result.complexityTier}")
    assert proj_result.overallScore > 60.0

    # 4. Test Alumni Matching Engine
    print("\n--- 4. Testing Alumni Matching Engine ---")
    match_payload = AlumniMatchRequest(
        studentId="student-test-alex",
        skills=["Go", "Kubernetes", "Distributed Systems"],
        interests=["Cloud Infrastructure"],
        targetRoles=["Backend Engineer", "Cloud Engineer"],
        topK=3,
    )
    match_result = matching_engine.match(match_payload)
    print(f"[OK] Evaluated {match_result.totalEvaluated} candidates. Top matches:")
    for m in match_result.matches:
        print(f"   - Alumni {m.alumniId}: Score {m.score} -> {m.rationale}")
    assert len(match_result.matches) == 3

    # 5. Test Career Guidance Engine
    print("\n--- 5. Testing Career Guidance Engine ---")
    guide_payload = CareerRecommendationRequest(
        studentId="student-test-alex",
        skills=["TypeScript", "PostgreSQL", "Docker"],
        targetRole="Backend Engineer",
        currentYear=3,
    )
    guide_result = await career_guidance_engine.generate_guidance(guide_payload)
    print(f"[OK] Guidance Target: {guide_result.targetRole}")
    print(f"[OK] Readiness: {guide_result.readinessScore}%")
    print(f"[OK] Recommended Steps: {len(guide_result.recommendedSteps)}")
    assert len(guide_result.recommendedSteps) == 3

    print("\n=== ALL 5 INTELLIGENCE ENGINES PASSED DIRECT VERIFICATION SUCCESSFULLY! ===")


if __name__ == "__main__":
    asyncio.run(run_diagnostics())
