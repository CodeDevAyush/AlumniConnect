import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_protected_endpoint_rejects_missing_api_key(client: AsyncClient):
    payload = {
        "studentId": "student-test-1",
        "skills": ["Python", "FastAPI"],
        "interests": ["Distributed Systems"],
        "targetRoles": ["Backend Engineer"],
    }
    # Request without X-Internal-API-Key should return 401
    response = await client.post("/api/v1/matching/alumni", json=payload)
    assert response.status_code == 401
    assert "Invalid or missing" in response.json()["detail"]


@pytest.mark.asyncio
async def test_protected_endpoint_accepts_valid_api_key(client: AsyncClient, auth_headers: dict):
    payload = {
        "studentId": "student-test-1",
        "skills": ["Python", "FastAPI"],
        "interests": ["Distributed Systems"],
        "targetRoles": ["Backend Engineer"],
    }
    response = await client.post(
        "/api/v1/matching/alumni",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["studentId"] == "student-test-1"
    assert len(data["matches"]) > 0
