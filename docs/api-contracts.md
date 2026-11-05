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
- **FastAPI AI service scaffold**: `http://localhost:8000/api/v1/docs` only when that service is implemented and running; candidate validation does not call it.

---

## 3. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Create a student or alumni account and return an access token | None |
| `POST` | `/api/v1/auth/login` | Verify credentials and return an access token | None |

Registration body:

```json
{
  "email": "student@example.edu",
  "password": "at-least-12-characters",
  "role": "STUDENT"
}
```

Registration permits `STUDENT` and `ALUMNI` roles. Passwords must be at least 12 characters and no more than 72 UTF-8 bytes. Responses contain `accessToken`, `tokenType`, `expiresIn`, and a limited user object; password hashes are never returned. Send the token as `Authorization: Bearer <accessToken>`.

> **Development limitation:** Email verification and refresh-token flows are not implemented. Newly registered accounts are active with `isEmailVerified: false`. Do not deploy this auth flow to production without completing those controls and reviewing token storage.

---

## 4. Candidate Validation (`/api/v1/candidate-validation`)

All routes below require a valid access token. The user ID is taken from the JWT, never from a caller-supplied path or request field.

For local UI/API testing, set `PROTOTYPE_IN_MEMORY=true` in `backend/.env`. Registration, login,
and these routes use process-local memory, so all data disappears at backend restart. Other
database-backed routes still require PostgreSQL. This setting is forbidden in production; see the
[local development guide](./local-development.md).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/candidate-validation/me` | Get the signed-in user's saved public-profile handles and latest assessment |
| `PUT` | `/api/v1/candidate-validation/profiles` | Save GitHub and coding-platform handles and record consent |
| `DELETE` | `/api/v1/candidate-validation/profiles` | Withdraw consent and delete saved handles and assessment history |
| `POST` | `/api/v1/candidate-validation/assessments` | Fetch supported public evidence and create an assessment snapshot |

Profile request:

```json
{
  "githubUsername": "sample-user",
  "codingPlatform": "CODEFORCES",
  "codingHandle": "sample-handle",
  "consent": true
}
```

Supported `codingPlatform` values are `CODEFORCES`, `LEETCODE`, `HACKERRANK`, and `CODECHEF`. Automated public-data collection is currently implemented only for GitHub and Codeforces. Other coding platforms are saved, but their assessments return `MANUAL_REVIEW` with `score: null`; their metrics are not scraped or guessed.

Automated assessment returns an overall `score` from 0 to 100 and component scores: GitHub (45), coding profile (45), and evidence availability (10). Status bands are `READY_FOR_REVIEW` (75+), `DEVELOPING` (55–74), and `NEEDS_MORE_EVIDENCE` (below 55). Supported provider evidence is saved as a timestamped JSON snapshot. `ownershipVerified` remains false: a handle or public profile is not proof that the signed-in user owns it.

The score is only a preliminary readiness signal. It must not be used as an automatic rejection or as a judgment of a person's worth. Provider not-found, rate-limit, and upstream failures return explicit errors; they are not converted into zero scores. API responses use the standard response envelope described above.

See [candidate-validation.md](./candidate-validation.md) for the current scoring rubric, limitations, and follow-up work.

---

## 5. NestJS Intelligence Endpoints (`/api/v1/intelligence`)

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

## 6. FastAPI Intelligence Engine Endpoints (`/api/v1`)

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

## 7. Security & Internal API Authentication

All calls from NestJS to FastAPI MUST pass the `X-Internal-API-Key` header matching `INTERNAL_API_SECRET_KEY`. Requests without this key are rejected with HTTP 401. Credentials are never sent to client browsers.
