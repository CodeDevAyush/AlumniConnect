import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_skill_gap_analysis(client: AsyncClient, auth_headers: dict):
    payload = {
        "currentSkills": ["Python", "FastAPI"],
        "targetRole": "backend engineer",
    }
    response = await client.post(
        "/api/v1/skills/gap-analysis",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["targetRole"] == "backend engineer"
    assert "missingSkills" in data
    assert len(data["recommendations"]) > 0


@pytest.mark.asyncio
async def test_capability_assessment(client: AsyncClient, auth_headers: dict):
    payload = {
        "studentId": "student-test-2",
        "skills": ["TypeScript", "NestJS", "PostgreSQL", "Docker"],
        "projectsCount": 3,
        "contributionsCount": 24,
        "interviewRating": 4.5,
    }
    response = await client.post(
        "/api/v1/capability/assess",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["overallScore"] > 0
    assert data["readinessTier"] in ["Developing", "Industry Ready", "Advanced"]
