import re
import logging
from typing import Dict, List, Any
from app.integrations.gemini_client import gemini_client
from app.schemas.skill_gap import (
    JobDescriptionAnalysisRequest,
    PrioritizedSkillAction,
    SkillGapComparisonResult,
)

logger = logging.getLogger("skill_gap_engine")


class SkillGapEngine:
    """
    Intelligent Skill-Gap Engine using Google Gemini structured output
    with deterministic fallback heuristic extraction.
    """

    FALLBACK_SKILL_KEYWORDS = [
        "python", "java", "c++", "golang", "go", "rust", "javascript", "typescript",
        "react", "next.js", "vue", "angular", "node.js", "express", "nest.js", "fastapi",
        "django", "flask", "spring boot", "postgresql", "mysql", "mongodb", "redis",
        "elasticsearch", "kafka", "rabbitmq", "docker", "kubernetes", "aws", "gcp",
        "azure", "ci/cd", "terraform", "linux", "graphql", "rest api", "grpc",
        "microservices", "system design", "data structures", "algorithms", "pytorch",
        "tensorflow", "scikit-learn", "pandas", "numpy", "git", "tailwind css",
    ]

    async def extract_job_requirements(self, jd_text: str) -> Dict[str, Any]:
        """Extracts required vs preferred skills from job description text via Gemini or fallback."""
        prompt = f"""
        Analyze the following technical job description. Extract the exact technical specifications as structured JSON.
        
        Job Description:
        \"\"\"{jd_text}\"\"\"

        Return JSON matching this schema:
        {{
            "jobTitle": "Extracted or inferred job title (e.g. Senior Backend Engineer)",
            "experienceLevel": "Entry | Mid-Level | Senior | Lead",
            "requiredSkills": ["list", "of", "strictly", "required", "technical", "skills"],
            "preferredSkills": ["list", "of", "nice-to-have", "skills"],
            "coreConcepts": ["System Design", "Distributed Systems", etc.]
        }}
        """
        system_instruction = "You are an expert technical recruiter and talent architect. Extract skills precisely without hallucinating non-technical terms."

        result = await gemini_client.generate_structured_json(prompt, system_instruction)
        if result and "requiredSkills" in result:
            return result

        # Deterministic Fallback Regex Extractor
        logger.info("Using deterministic fallback NLP extractor for job description.")
        found_skills = []
        lower_jd = jd_text.lower()
        for kw in self.FALLBACK_SKILL_KEYWORDS:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower_jd):
                found_skills.append(kw.title())

        mid = len(found_skills) // 2
        return {
            "jobTitle": "Software Engineer",
            "experienceLevel": "Entry to Mid-Level",
            "requiredSkills": found_skills[:mid] or ["Data Structures", "Algorithms", "Git"],
            "preferredSkills": found_skills[mid:] or ["Docker", "PostgreSQL"],
            "coreConcepts": ["System Design", "API Development"],
        }

    async def analyze_gap(
        self, request: JobDescriptionAnalysisRequest
    ) -> SkillGapComparisonResult:
        extracted = await self.extract_job_requirements(request.jobDescriptionText)
        job_title = extracted.get("jobTitle", request.targetRole or "Target Technical Role")
        required_skills = extracted.get("requiredSkills", [])
        preferred_skills = extracted.get("preferredSkills", [])

        all_target_skills = required_skills + preferred_skills
        student_skills = [s.strip().lower() for s in request.studentSkills or []]

        demonstrated: List[str] = []
        needing_improvement: List[str] = []
        without_evidence: List[str] = []

        for req in all_target_skills:
            req_lower = req.lower()
            if req_lower in student_skills:
                demonstrated.append(req)
            elif any(s in req_lower or req_lower in s for s in student_skills):
                needing_improvement.append(req)
            else:
                without_evidence.append(req)

        # Match calculation: Demonstrated counts 100%, Needing Improvement counts 40%
        total_eval = max(len(all_target_skills), 1)
        match_score = round(
            ((len(demonstrated) * 1.0 + len(needing_improvement) * 0.4) / total_eval) * 100.0,
            1,
        )

        # Generate Prioritized Action Roadmap
        roadmap: List[PrioritizedSkillAction] = []

        # High priority: Required skills without evidence
        for skill in without_evidence:
            is_critical = skill in required_skills
            roadmap.append(
                PrioritizedSkillAction(
                    skill=skill,
                    priority="HIGH" if is_critical else "MEDIUM",
                    reason=f"Listed as {'core requirement' if is_critical else 'preferred'} in {job_title} specification.",
                    recommendedLearningAction=f"Implement an end-to-end service or module explicitly leveraging {skill}.",
                    suggestedProjectIdea=f"Build a microservice showcasing {skill} integration with comprehensive test suites.",
                    estimatedWeeksToAcquire=3 if is_critical else 2,
                )
            )

        # Medium priority: Skills needing improvement
        for skill in needing_improvement:
            roadmap.append(
                PrioritizedSkillAction(
                    skill=skill,
                    priority="MEDIUM",
                    reason="Partial skill foundation identified; deepening practical implementation is needed.",
                    recommendedLearningAction=f"Refactor existing projects to use advanced architectural patterns with {skill}.",
                    suggestedProjectIdea=f"Implement performance benchmarks and caching strategies around {skill}.",
                    estimatedWeeksToAcquire=2,
                )
            )

        # Sort roadmap by priority
        priority_rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        roadmap.sort(key=lambda x: priority_rank.get(x.priority, 1))

        summary = (
            f"Evaluated against {job_title}. Current profile matches {match_score}% of target requirements. "
            f"You have demonstrated {len(demonstrated)} core skill(s). Addressing {len(without_evidence)} "
            f"missing skill(s) will position you as an immediate top-tier candidate."
        )

        return SkillGapComparisonResult(
            targetRole=request.targetRole or job_title,
            jobTitle=job_title,
            matchPercentage=match_score,
            demonstratedSkills=demonstrated,
            skillsNeedingImprovement=needing_improvement,
            skillsWithoutEvidence=without_evidence,
            prioritizedRoadmap=roadmap,
            executiveSummary=summary,
        )


skill_gap_engine = SkillGapEngine()

