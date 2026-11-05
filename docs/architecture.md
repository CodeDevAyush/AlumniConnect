# AlumniConnect System Architecture

## 1. Executive Summary

**AlumniConnect** is an enterprise campus networking platform designed to bridge the gap between current university students and verified alumni. The platform replaces fractured, unmonitored communication channels with an active, secure, outcome-driven ecosystem offering **verified institutional directory discovery, 1-on-1 mentorship cycles, peer-to-peer referral pipelines, and AI-powered skill-gap and match diagnostics**.

---

## 2. Monorepo Organization

The project is structured as a unified monorepo providing modular independence while maintaining atomic repository history and shared infrastructure:

```
AlumniConnect/
├── frontend/               # Next.js 14 App Router, React, Tailwind CSS, TypeScript
├── backend/                # NestJS Core API, Prisma ORM, Socket.IO, PostgreSQL, Redis
├── ai-service/             # FastAPI AI/ML Engine, Scikit-learn, Pandas, Pydantic
├── infrastructure/         # Docker Compose, Database scripts, Render & Vercel deployment specs
├── docs/                   # Engineering standards, architecture & operational guides
├── scripts/                # Local development, linting, migration & seed scripts
└── .github/workflows/      # CI/CD pipelines (Lint, Test, Build, Docker verification)
```

---

## 3. Technology Stack & Component Responsibilities

```
                                  +-----------------------+
                                  |     User Browser      |
                                  +-----------+-----------+
                                              |
                                              | HTTPS / WSS
                                              v
                                  +-----------------------+
                                  | Next.js Client (3000) |
                                  +-----------+-----------+
                                              |
                                              | HTTP REST (Public API)
                                              v
                                  +-----------------------+
                                  |  NestJS Core (4000)   |
                                  +-----+-----------+-----+
                                        |           |
                        Internal HTTP   |           | Prisma Client
                   (X-Internal-API-Key) |           v
                                        |     +-------------------------+
                                        |     | PostgreSQL (5432)       |
                                        |     | Redis (6379)            |
                                        |     +-------------------------+
                                        v
                            +-----------------------+
                            | FastAPI AI Engine (8000)|
                            +-----------------------+
                            | Scikit-learn / Pandas |
                            | Vector Matching       |
                            | Skill Gap Analysis    |
                            +-----------------------+
```

### 3.1. Frontend (`frontend/`)
- **Technology**: Next.js (App Router), React 18, TypeScript (strict mode), Tailwind CSS, Lucide icons.
- **Responsibility**:
  - Delivers a server-rendered and client-hydrated responsive experience.
  - Interacts exclusively with the NestJS Core API via typed HTTP client (`api-client.ts`).
  - Implements reusable UI component primitives (`Button`, `Card`, `Badge`, `Input`) adhering to unified design tokens.

### 3.2. Main Backend (`backend/`)
- **Technology**: NestJS 10, TypeScript, Prisma ORM, Socket.IO, Passport JWT, Winston, Helmet.
- **Responsibility**:
  - Serves as the platform's primary business gateway and authoritative data coordinator.
  - Manages identity, authentication, JWT tokens, RBAC permissions, and institutional verifications.
  - Provides real-time bidirectional messaging via WebSocket gateway.
  - Coordinates with the AI service over an authenticated internal HTTP interface.

### 3.3. AI/ML Service (`ai-service/`)
- **Technology**: Python 3.11+, FastAPI, Pydantic v2, Scikit-learn, Pandas, NumPy, XGBoost/CatBoost ready.
- **Responsibility**:
  - Operates as a stateless microservice dedicated to data science, natural language evaluation, and recommendations.
  - Evaluates student resumes, skills, and GitHub metrics.
  - Computes TF-IDF vector similarity and semantic overlap for student-alumni pairing.
  - Protected behind an internal secret key header (`X-Internal-API-Key`); never exposed directly to client browsers.

> **Current implementation status:** The AI service is scaffolded, but it does not currently provide the operational service described above. Candidate profile assessment is implemented in NestJS and does not call FastAPI.

### 3.4. Candidate profile assessment
- **Location**: `backend/src/modules/candidate-validation/`
- **Responsibility**: Stores authenticated users' consented GitHub/coding handles, fetches public evidence from GitHub, Codeforces, and LeetCode, applies a transparent pilot rubric, and persists timestamped evidence snapshots.
- **Limitations**: Profile ownership is not verified. Automated coding-profile scoring supports Codeforces and LeetCode; HackerRank and CodeChef require manual review. LeetCode uses an unversioned public GraphQL endpoint. Scores are readiness signals, not automatic decisions.
- **Routes**: See `docs/api-contracts.md` and the detailed rubric in `docs/candidate-validation.md`.

---

## 4. Communication & Security Architecture

1. **Browser to Backend**: All client traffic is directed to the NestJS Core API (`/api/v1`). CORS policies restrict access to configured domains.
2. **Backend to AI Service**: NestJS makes server-to-server HTTP calls to FastAPI using an internal secret key (`X-Internal-API-Key`). FastAPI rejects unauthenticated requests with HTTP 401.
3. **Database Isolation**: PostgreSQL and Redis run within the internal container network. Only the backend connects to the relational store.
4. **Data Validation**:
   - NestJS utilizes `class-validator` and `class-transformer` with strict whitelisting and implicit conversion.
   - FastAPI enforces schema constraints via Pydantic v2 models.
