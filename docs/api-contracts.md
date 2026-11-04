# API Contracts & Service Communication

## 1. Design Standards

- **Standard Prefix**: All REST endpoints are prefixed with `/api/v1`.
- **Response Enveloping**: Both NestJS and FastAPI services return predictable JSON envelopes:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-04T22:00:00.000Z",
    "path": "/api/v1/health",
    "version": "v1"
  }
}
```

---

## 2. Interactive Documentation Interfaces

- **NestJS Core Gateway**: `http://localhost:4000/api/docs`
- **FastAPI AI Intelligence Subsystem**: `http://localhost:8000/api/v1/docs`

---

## 3. NestJS Intelligence Endpoints (`/api/v1/intelligence`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/intelligence/capability/tracks` | Lists 8 supported technical tracks & weights | None |
| `POST` | `/api/v1/intelligence/capability/assess/:userId` | Runs 5-dimensional capability assessment | Bearer JWT |
| `POST` | `/api/v1/intelligence/skills/gap-analysis/:userId` | Compares JD text against student capability | Bearer JWT |
| `POST` | `/api/v1/intelligence/coding/analyze/:userId` | Analyzes LeetCode & Codeforces handles | Bearer JWT |
| `POST` | `/api/v1/intelligence/projects/evaluate` | Evaluates project submission against rubrics | Bearer JWT |
| `POST` | `/api/v1/intelligence/recommendations/career/:userId` | Generates personalized milestone roadmap | Bearer JWT |
| `POST` | `/api/v1/intelligence/alumni-match/:userId` | Matches student with alumni mentors & referrers | Bearer JWT |

---

## 4. FastAPI Intelligence Engine Endpoints (`/api/v1`)

| Method | Endpoint | Description | Header Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health & model status probe | None |
| `GET` | `/api/v1/capability/tracks` | Returns 8 technical track definitions | `X-Internal-API-Key` |
| `POST` | `/api/v1/capability/assess` | 5-Dimensional capability evaluation | `X-Internal-API-Key` |
| `POST` | `/api/v1/skills/gap-analysis` | JD parsing & skill gap roadmap | `X-Internal-API-Key` |
| `POST` | `/api/v1/skills/extract-jd` | Gemini LLM JD skill extraction | `X-Internal-API-Key` |
| `POST` | `/api/v1/coding/analyze` | Codeforces + LeetCode performance metrics | `X-Internal-API-Key` |
| `GET` | `/api/v1/github/evaluate/{username}` | GitHub repository hygiene & commit metrics | `X-Internal-API-Key` |
| `POST` | `/api/v1/projects/evaluate` | Multi-criteria project evaluation rubric | `X-Internal-API-Key` |
| `POST` | `/api/v1/matching/alumni` | Multi-factor TF-IDF alumni matching | `X-Internal-API-Key` |
| `POST` | `/api/v1/recommendations/career` | Evidence-grounded career guidance | `X-Internal-API-Key` |

---

## 5. Security & Internal API Authentication

All calls from NestJS to FastAPI MUST pass the `X-Internal-API-Key` header matching `INTERNAL_API_SECRET_KEY`. Requests without this key are rejected with HTTP 401. Credentials are never sent to client browsers.
