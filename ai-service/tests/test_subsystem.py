import unittest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


class TestAiSubsystem(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.transport = ASGITransport(app=app)
        self.client = AsyncClient(transport=self.transport, base_url="http://testserver")
        self.auth_headers = {"X-Internal-API-Key": settings.INTERNAL_API_SECRET_KEY}

    async def asyncTearDown(self):
        await self.client.aclose()

    # 1. Health Probe
    async def test_health_endpoint(self):
        res = await self.client.get("/api/v1/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("SDE", data["supportedTracks"])
        self.assertTrue(data["integrations"]["codeforcesIntegration"])

    # 2. Security Enforcement
    async def test_protected_routes_require_internal_key(self):
        # Missing key should return 401
        res = await self.client.post("/api/v1/matching/alumni", json={"studentId": "s-1"})
        self.assertEqual(res.status_code, 401)

        # Invalid key should return 401
        res2 = await self.client.post(
            "/api/v1/matching/alumni",
            json={"studentId": "s-1"},
            headers={"X-Internal-API-Key": "wrong-secret-key"},
        )
        self.assertEqual(res2.status_code, 401)

    # 3. Available Technical Tracks Catalog
    async def test_get_tracks(self):
        res = await self.client.get("/api/v1/capability/tracks", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["totalTracks"], 8)

    # 4. Capability Assessment Engine (5 Dimensions & Missing Evidence)
    async def test_capability_assessment_engine(self):
        payload = {
            "studentId": "student-alex-001",
            "selectedTrack": "BACKEND",
            "selfReportedSkills": ["TypeScript", "NestJS", "PostgreSQL", "Docker", "Redis"],
            "internalAssessments": [{"subject": "Distributed Systems", "score": 88}],
            "manualProjects": [
                {
                    "title": "AlumniConnect Platform",
                    "techStack": ["TypeScript", "NestJS", "PostgreSQL", "Docker"],
                }
            ],
        }
        res = await self.client.post(
            "/api/v1/capability/assess",
            json=payload,
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["studentId"], "student-alex-001")
        self.assertEqual(data["track"], "BACKEND")
        self.assertGreater(data["overallCapabilityScore"], 40.0)
        self.assertIn("coding_performance", data["dimensionScores"])
        self.assertIn("development_capability", data["dimensionScores"])
        self.assertIn("technical_fundamentals", data["dimensionScores"])
        self.assertIn("practical_application", data["dimensionScores"])
        self.assertIn("consistency_growth", data["dimensionScores"])
        # Verify missing evidence is captured
        self.assertTrue(len(data["missingEvidenceNotices"]) > 0)

    # 5. Skill Gap Engine (with Mocked LLM Extraction)
    @patch("app.services.skill_gap_engine.gemini_client.generate_structured_json", new_callable=AsyncMock)
    async def test_skill_gap_analysis(self, mock_gemini):
        mock_gemini.return_value = {
            "jobTitle": "Senior Backend Engineer",
            "experienceLevel": "Senior",
            "requiredSkills": ["Python", "PostgreSQL", "Docker", "Kubernetes"],
            "preferredSkills": ["Redis", "Kafka", "AWS"],
            "coreConcepts": ["Distributed Systems"],
        }
        payload = {
            "jobDescriptionText": "Seeking a Senior Backend Engineer proficient in Python, PostgreSQL, Docker, and Kubernetes.",
            "targetRole": "Backend Engineer",
            "studentSkills": ["Python", "PostgreSQL", "Docker"],
        }
        res = await self.client.post(
            "/api/v1/skills/gap-analysis",
            json=payload,
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["matchPercentage"], 0.0)
        self.assertTrue(len(data["demonstratedSkills"]) > 0)
        self.assertTrue(len(data["prioritizedRoadmap"]) > 0)

    # 6. Project Evaluation Service (Deterministic Rubric + Mocked LLM)
    @patch("app.services.project_evaluation_service.gemini_client.generate_text", new_callable=AsyncMock)
    async def test_project_evaluation(self, mock_gemini_text):
        mock_gemini_text.return_value = "Excellent architecture and test-driven engineering discipline."
        payload = {
            "title": "Distributed Task Queue",
            "description": "A high-throughput distributed task scheduler built with TypeScript, Redis, and PostgreSQL with full unit and integration test suites.",
            "techStack": ["TypeScript", "Redis", "PostgreSQL", "Docker"],
            "repositoryUrl": "https://github.com/example/task-queue",
            "liveDemoUrl": "https://taskqueue.example.com",
            "architectureOverview": "Microservice architecture separating worker consumers from the job ingestor API.",
        }
        res = await self.client.post(
            "/api/v1/projects/evaluate",
            json=payload,
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["overallScore"], 60.0)
        self.assertEqual(len(data["rubricBreakdown"]), 5)

    # 7. Alumni-Student Matching
    async def test_alumni_matching_engine(self):
        payload = {
            "studentId": "student-alex",
            "skills": ["Go", "Kubernetes", "Distributed Systems"],
            "interests": ["Cloud Infrastructure"],
            "targetRoles": ["Backend Engineer", "Cloud Engineer"],
            "topK": 3,
        }
        res = await self.client.post(
            "/api/v1/matching/alumni",
            json=payload,
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["matches"]), 3)
        top_match = data["matches"][0]
        self.assertGreater(top_match["score"], 0.0)
        self.assertTrue(len(top_match["rationale"]) > 5)

    # 8. Career Guidance Engine (with Mocked LLM)
    @patch("app.services.career_guidance_engine.gemini_client.generate_text", new_callable=AsyncMock)
    async def test_career_guidance(self, mock_gemini_text):
        mock_gemini_text.return_value = "Focus on distributed locking with Redis."
        payload = {
            "studentId": "student-alex",
            "skills": ["TypeScript", "PostgreSQL", "Docker"],
            "targetRole": "Backend Engineer",
            "currentYear": 3,
        }
        res = await self.client.post(
            "/api/v1/recommendations/career",
            json=payload,
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["studentId"], "student-alex")
        self.assertGreater(data["readinessScore"], 40.0)
        self.assertEqual(len(data["recommendedSteps"]), 3)


if __name__ == "__main__":
    unittest.main()
