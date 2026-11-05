# Local Development Guide

This guide details how to set up, configure, and execute the complete AlumniConnect system on your local workstation.

---

## 1. Prerequisites

Ensure your host machine has the following tools installed:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x`
- **Python**: `v3.11.x` or `v3.12.x` / `v3.13.x`
- **Docker & Docker Compose**: Docker Engine v24+ & Docker Compose v2+
- **Git**: Installed and configured

---

## 2. Quickstart with Docker Compose

The fastest way to spin up the complete environment (PostgreSQL, Redis, AI Service, NestJS Backend, and Next.js Frontend) is using Docker Compose:

```bash
# 1. Clone repository
git clone https://github.com/CodeDevAyush/AlumniConnect.git
cd AlumniConnect

# 2. Copy root environment template
cp .env.example .env

# 3. Start all services with live reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Access URLs:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Backend Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **AI Service Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **PostgreSQL**: `localhost:5432` (`alumniconnect_db`)
- **Redis**: `localhost:6379`

---

## 3. Running Services Independently (Bare-Metal)

For rapid inner-loop development, you can run PostgreSQL and Redis in Docker while executing application processes natively.

### Database-free candidate-validation prototype

The candidate-validation/auth prototype can run without PostgreSQL for a local UI/API demo. In
`backend/.env`, set `PROTOTYPE_IN_MEMORY=true`; the sample JWT secrets are already present in
`.env.example`. `DATABASE_URL` is ignored in this mode. Then start the backend from PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
# Set PROTOTYPE_IN_MEMORY=true in backend/.env
npm.cmd run start:dev
```

In-memory accounts, linked handles, and assessments are erased whenever the backend process stops
or restarts. Only registration, login, and `/api/v1/candidate-validation` are supported without
PostgreSQL; other database-backed routes need the normal database setup below. The mode is rejected
in production and is not suitable for deployment.

### Step 3.1: Start Infrastructure
```bash
# In repository root
docker-compose up -d postgres redis
```

### Step 3.2: Configure & Start Main Backend
```bash
cd backend

# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma Client & Run Initial Migration
npx prisma generate
npx prisma migrate dev --name init_schema

# Seed Initial Platform Data (Admin, Alumni, Student)
npm run prisma:seed

# Start development server with hot-reload
npm run start:dev
```

### Step 3.3: Configure & Start AI Service
```bash
cd ai-service

# Copy environment
cp .env.example .env

# Create and activate Python virtual environment
python -m venv .venv

# On Linux/macOS:
source .venv/bin/activate
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements-dev.txt

# Start FastAPI server with live reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3.4: Configure & Start Frontend
```bash
cd frontend

# Copy environment
cp .env.example .env.local

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

---

## 4. Linting and Testing

Execute cross-monorepo checks using provided automation scripts:

```bash
# Lint all three applications
npm run lint
# or: ./scripts/lint-all.sh (Bash) | ./scripts/lint-all.ps1 (PowerShell)

# Run test suites across all three stacks
npm run test
# or: ./scripts/test-all.sh (Bash) | ./scripts/test-all.ps1 (PowerShell)
```
