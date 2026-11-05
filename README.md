# 🎓 AlumniConnect — Your Campus Network, Activated

[![Frontend CI](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/backend-ci.yml)
[![AI Service CI](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/ai-service-ci.yml/badge.svg)](https://github.com/CodeDevAyush/AlumniConnect/actions/workflows/ai-service-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AlumniConnect** is an institutional campus networking and mentorship platform designed to bridge the gap between current university students and verified alumni. With verified degree credentials, intelligent AI matching, structured mentorship cycles, and an internal referral pipeline, AlumniConnect activates the university's most valuable asset: its alumni community.

---

## 🏛️ System Architecture

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

---

## 🚀 Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) 14 (App Router), React 18, TypeScript, Tailwind CSS | Server components, responsive design tokens, typed API client |
| **Main Backend** | [NestJS](https://nestjs.com/) 10, TypeScript, Prisma ORM, Socket.IO | Enterprise modularity, JWT auth, RBAC guards, Swagger docs |
| **AI / ML Service** | [FastAPI](https://fastapi.tiangolo.com/), Python 3.11+, Scikit-learn, Pandas, Pydantic v2 | TF-IDF vector matching, capability scoring, skill-gap analysis |
| **Datastores** | PostgreSQL 16 & Redis 7 | Relational persistence, UUID v4 primary keys, fast caching |
| **DevOps & Infra** | Docker, Docker Compose, GitHub Actions | Multi-stage production containers, automated CI matrix |

---

## 📁 Repository Structure

```
AlumniConnect/
├── frontend/                     # Next.js client web application
│   ├── app/                      # App router (Landing, Auth, Discovery, Mentorship, Opportunities)
│   ├── components/               # Reusable UI primitives (Button, Card, Badge, Input)
│   ├── features/                 # Modular feature domains
│   ├── services/                 # Typed Axios API client
│   ├── types/                    # Shared client TypeScript types
│   └── Dockerfile                # Production multi-stage container
├── backend/                      # NestJS core business API
│   ├── src/
│   │   ├── modules/              # Auth, Users, Profiles, Verification, Discovery, Mentorship...
│   │   ├── common/               # Filters, Guards, Interceptors, DTOs
│   │   ├── database/             # Prisma service & database module
│   │   └── config/               # Joi environment validation & configuration
│   ├── prisma/                   # PostgreSQL schema definition & seed scripts
│   └── Dockerfile                # Production multi-stage container
├── ai-service/                   # Python FastAPI AI / Data Science service
│   ├── app/
│   │   ├── api/v1/endpoints/     # Health, Matching, Skill-gap, Capability, GitHub eval
│   │   ├── core/                 # Config, Security (X-Internal-API-Key), Logging
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   └── services/             # Scikit-learn TF-IDF matcher & analytics
│   ├── tests/                    # Pytest test suites
│   └── Dockerfile                # Production multi-stage container
├── infrastructure/               # Database initialization SQL, deployment specs (Render, Vercel)
├── docs/                         # Engineering architecture, DB guide, API specs, CI/CD
├── scripts/                      # Cross-platform development and test scripts
├── docker-compose.yml            # Local container orchestration
└── docker-compose.dev.yml        # Development hot-reloading overlay
```

---

## ⚡ Quick Start

### 1. Using Docker Compose (Full Stack)

```bash
# Clone the repository
git clone https://github.com/CodeDevAyush/AlumniConnect.git
cd AlumniConnect

# Create local environment configuration
cp .env.example .env

# Boot the entire stack with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 2. Native Development (Running Services Independently)

#### A. Start PostgreSQL & Redis
```bash
docker-compose up -d postgres redis
```

#### B. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init_schema
npm run prisma:seed
npm run start:dev
```

#### C. Setup AI Service
```bash
cd ai-service
cp .env.example .env
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements-dev.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### D. Setup Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 🌐 Endpoints & Documentation

| Service | Port | Local URL | Swagger / OpenAPI Docs |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `3000` | [http://localhost:3000](http://localhost:3000) | — |
| **NestJS Backend** | `4000` | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) |
| **FastAPI AI Service** | `8000` | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) | [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs) |

---

## 🧪 Testing & Quality Assurance

Run the test matrix across the entire monorepo:

```bash
# Run tests across backend, frontend, and AI engine
npm test

# Run linter and formatting checks
npm run lint
```

For platform-specific shell scripts:
- **Bash**: `./scripts/test-all.sh` & `./scripts/lint-all.sh`
- **PowerShell**: `./scripts/test-all.ps1` & `./scripts/lint-all.ps1`

---

## 📖 In-Depth Guides

- 📐 [Architecture Deep Dive](docs/architecture.md)
- 💻 [Local Development Guide](docs/local-development.md)
- 🔑 [Environment Variables Reference](docs/environment-variables.md)
- 🗄️ [Database Architecture & Migrations](docs/database-guide.md)
- 📡 [API Contracts & Security](docs/api-contracts.md)
- ✅ [Candidate Profile Assessment](docs/candidate-validation.md)
- 🔄 [CI/CD Automation Pipelines](docs/ci-cd.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
