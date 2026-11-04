import logging
from typing import List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.schemas.matching import (
    AlumniCandidate,
    AlumniMatchRequest,
    AlumniMatchResponse,
    MatchScoreResult,
)

logger = logging.getLogger("matching_engine")


class AlumniMatchingEngine:
    """
    Explainable Multi-Objective Alumni-Student Recommendation Engine.
    Combines TF-IDF semantic vector similarity with deterministic preference weighting.
    """

    def __init__(self):
        # Default mock candidate pool if none is passed in request payload
        self.default_pool = [
            AlumniCandidate(
                id="alumni-sarah-chen",
                name="Sarah Chen",
                company="Google",
                title="Senior Staff Software Engineer",
                skills=["Go", "Kubernetes", "Distributed Systems", "Python", "Cloud Architecture", "System Design"],
                industry="Cloud Infrastructure",
                yearsOfExperience=6,
                willingToMentor=True,
                willingToRefer=True,
            ),
            AlumniCandidate(
                id="alumni-marcus-vance",
                name="Marcus Vance",
                company="Stripe",
                title="Lead Infrastructure Engineer",
                skills=["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "API Design", "Distributed Systems"],
                industry="FinTech",
                yearsOfExperience=5,
                willingToMentor=True,
                willingToRefer=False,
            ),
            AlumniCandidate(
                id="alumni-priya-sharma",
                name="Priya Sharma",
                company="Meta",
                title="Machine Learning Engineer",
                skills=["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "Data Science", "Scikit-learn"],
                industry="Artificial Intelligence",
                yearsOfExperience=4,
                willingToMentor=True,
                willingToRefer=True,
            ),
            AlumniCandidate(
                id="alumni-david-kim",
                name="David Kim",
                company="Datadog",
                title="Senior Backend Engineer",
                skills=["Go", "Python", "Kafka", "Redis", "Distributed Tracing", "Microservices", "Docker"],
                industry="Observability & Cloud",
                yearsOfExperience=4,
                willingToMentor=True,
                willingToRefer=True,
            ),
            AlumniCandidate(
                id="alumni-elena-rodriguez",
                name="Elena Rodriguez",
                company="Vercel",
                title="Senior Frontend Architect",
                skills=["TypeScript", "React", "Next.js", "Tailwind CSS", "Web Performance", "GraphQL"],
                industry="Developer Tools",
                yearsOfExperience=5,
                willingToMentor=True,
                willingToRefer=True,
            ),
        ]

    def match(self, request: AlumniMatchRequest) -> AlumniMatchResponse:
        candidates = request.candidates if request.candidates else self.default_pool
        if not candidates:
            return AlumniMatchResponse(studentId=request.studentId, totalEvaluated=0, matches=[])

        student_query = " ".join(
            request.skills + request.interests + request.targetRoles
        ).lower()

        candidate_texts = [
            f"{c.title} {c.company} {c.industry or ''} {' '.join(c.skills)}".lower()
            for c in candidates
        ]

        corpus = [student_query] + candidate_texts

        # Compute TF-IDF Cosine Similarity
        vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
        tfidf_matrix = vectorizer.fit_transform(corpus)
        semantic_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        student_skills_set = {s.lower().strip() for s in request.skills}
        target_roles_lower = [r.lower().strip() for r in request.targetRoles]

        results: List[MatchScoreResult] = []

        for idx, candidate in enumerate(candidates):
            sim_score = float(semantic_similarities[idx])
            cand_skills_set = {s.lower().strip() for s in candidate.skills}

            overlap = student_skills_set.intersection(cand_skills_set)
            missing = cand_skills_set.difference(student_skills_set)

            # Role alignment bonus
            role_bonus = 0.0
            if any(role in candidate.title.lower() for role in target_roles_lower):
                role_bonus = 0.15

            # Mentorship & referral willingness bonus
            willingness_bonus = (0.10 if candidate.willingToMentor else 0.0) + (
                0.05 if candidate.willingToRefer else 0.0
            )

            # Experience calibration: 3-8 years is optimal for collegiate mentorship
            exp = candidate.yearsOfExperience or 2
            exp_factor = 0.08 if 3 <= exp <= 8 else 0.04

            # Final blended score
            composite_score = (
                (sim_score * 0.50)
                + role_bonus
                + willingness_bonus
                + exp_factor
            )
            normalized_score = min(round(composite_score, 3), 0.99)
            normalized_score = max(normalized_score, 0.10)

            rationale_parts = []
            if overlap:
                rationale_parts.append(f"Shares {len(overlap)} core skill(s) ({', '.join(list(overlap)[:3])})")
            if role_bonus > 0:
                rationale_parts.append(f"Current role aligns with your target role ({candidate.title})")
            if candidate.willingToRefer:
                rationale_parts.append(f"Open to employee referrals at {candidate.company}")

            results.append(
                MatchScoreResult(
                    alumniId=candidate.id,
                    score=normalized_score,
                    matchedSkills=[s for s in candidate.skills if s.lower() in overlap],
                    missingSkills=[s for s in candidate.skills if s.lower() in missing],
                    rationale=". ".join(rationale_parts) or f"{candidate.title} at {candidate.company}.",
                )
            )

        # Sort by highest match score
        results.sort(key=lambda x: x.score, reverse=True)
        top_matches = results[: request.topK]

        return AlumniMatchResponse(
            studentId=request.studentId,
            totalEvaluated=len(candidates),
            matches=top_matches,
        )


matching_engine = AlumniMatchingEngine()

