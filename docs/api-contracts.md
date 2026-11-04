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

- **Error Enveloping**:
```json
{
  "success": false,
  "statusCode": 400,
  "path": "/api/v1/auth/login",
  "timestamp": "2026-11-04T22:00:00.000Z",
  "message": "Validation failed",
  "error": ["email must be an email"]
}
```

---

## 2. Interactive Swagger / OpenAPI Documentation

- **NestJS Core API**: `http://localhost:4000/api/docs`
- **FastAPI AI Service**: `http://localhost:8000/api/v1/docs`

---

## 3. Core API Endpoint Catalog

### 3.1. Main Backend (`backend/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check probe | None |
| `POST`| `/api/v1/auth/login` | Authenticate user credentials | None |
| `POST`| `/api/v1/auth/register`| Register student or alumni account | None |
| `GET` | `/api/v1/users/:id` | Fetch user account details | Bearer JWT |
| `GET` | `/api/v1/profiles/:userId` | Fetch user profile & role extensions | Bearer JWT |
| `GET` | `/api/v1/discovery/alumni` | Search alumni directory | Bearer JWT |
| `GET` | `/api/v1/connections/user/:id` | List verified connections | Bearer JWT |
| `GET` | `/api/v1/mentorship/requests/:id` | List mentorship requests | Bearer JWT |
| `GET` | `/api/v1/referrals/alumni` | Search alumni willing to refer | Bearer JWT |
| `GET` | `/api/v1/opportunities` | List active job & internship listings | Bearer JWT |
| `GET` | `/api/v1/admin/stats` | Platform statistics | Admin Role |

### 3.2. AI/ML Service (`ai-service/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health & model status probe | None |
| `POST`| `/api/v1/matching/alumni` | TF-IDF / Cosine Similarity alumni matching | `X-Internal-API-Key` |
| `POST`| `/api/v1/skills/gap-analysis` | Skill-gap assessment against role benchmarks | `X-Internal-API-Key` |
| `POST`| `/api/v1/capability/assess` | Multi-category capability score breakdown | `X-Internal-API-Key` |
| `POST`| `/api/v1/coding/github-analysis`| Automated code hygiene & testing review | `X-Internal-API-Key` |
| `GET` | `/api/v1/github/evaluate/{user}`| Direct GitHub language & activity aggregation | `X-Internal-API-Key` |
| `POST`| `/api/v1/projects/evaluate` | Technical complexity evaluation | `X-Internal-API-Key` |
| `POST`| `/api/v1/recommendations/career`| Phased milestone career recommendations | `X-Internal-API-Key` |

---

## 4. Internal Service Authentication

Requests from NestJS to FastAPI MUST include the `X-Internal-API-Key` HTTP header. The secret is shared securely via environment configuration and never sent to or visible in client browsers.
