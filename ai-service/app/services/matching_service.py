from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.schemas.matching import (
    AlumniCandidate,
    AlumniMatchRequest,
    AlumniMatchResponse,
    MatchScoreResult,
)


class AlumniMatchingService:
    def __init__(self):
        # Default mock candidate pool if none is provided in request
        self.default_candidates = [
            AlumniCandidate(
                id="alumni-1",
                name="Sarah Chen",
                company="Google",
                title="Senior Staff Software Engineer",
                skills=["Go", "Kubernetes", "Distributed Systems", "Python", "Cloud Architecture"],
                industry="Cloud Infrastructure",
                yearsOfExperience=6,
                willingToMentor=True,
                willingToRefer=True,
            ),
            AlumniCandidate(
                id="alumni-2",
                name="Marcus Vance",
                company="Stripe",
                title="Lead Infrastructure Engineer",
                skills=["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "API Design"],
                industry="FinTech",
                yearsOfExperience=5,
                willingToMentor=True,
                willingToRefer=False,
            ),
            AlumniCandidate(
                id="alumni-3",
                name="Priya Sharma",
                company="Meta",
                title="Machine Learning Engineer",
                skills=["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "Data Science"],
                industry="Artificial Intelligence",
                yearsOfExperience=4,
                willingToMentor=True,
                willingToRefer=True,
            ),
        ]

    def match_alumni(self, request: AlumniMatchRequest) -> AlumniMatchResponse:
        candidates = request.candidates if request.candidates else self.default_candidates
        if not candidates:
            return AlumniMatchResponse(studentId=request.studentId, totalEvaluated=0, matches=[])

        student_text = " ".join(request.skills + request.interests + request.targetRoles)
        candidate_texts = [" ".join(c.skills + [c.company, c.title]) for c in candidates]

        corpus = [student_text] + candidate_texts
        vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
        tfidf_matrix = vectorizer.fit_transform(corpus)

        # Compute cosine similarity between student (index 0) and all candidates (index 1..)
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        student_skills_set = {s.lower() for s in request.skills}
        results: List[MatchScoreResult] = []

        for idx, candidate in enumerate(candidates):
            sim_score = float(similarities[idx])
            cand_skills_set = {s.lower() for s in candidate.skills}
            overlap = student_skills_set.intersection(cand_skills_set)
            missing = cand_skills_set.difference(student_skills_set)

            # Boost if willing to mentor and refer
            boost = (0.1 if candidate.willingToMentor else 0.0) + (0.05 if candidate.willingToRefer else 0.0)
            final_score = min(round(float(sim_score * 0.85 + boost), 3), 1.0)

            results.append(
                MatchScoreResult(
                    alumniId=candidate.id,
                    score=final_score,
                    matchedSkills=[s for s in candidate.skills if s.lower() in overlap],
                    missingSkills=[s for s in candidate.skills if s.lower() in missing],
                    rationale=f"Matches {len(overlap)} skills. {candidate.yearsOfExperience} yrs at {candidate.company}.",
                )
            )

        # Sort by highest score descending
        results.sort(key=lambda x: x.score, reverse=True)
        top_matches = results[: request.topK]

        return AlumniMatchResponse(
            studentId=request.studentId,
            totalEvaluated=len(candidates),
            matches=top_matches,
        )


matching_service = AlumniMatchingService()
