# Continuous Integration & Continuous Deployment (CI/CD)

## 1. Overview

AlumniConnect utilizes GitHub Actions to enforce rigorous quality, formatting, security, and build validation across all branches and pull requests.

---

## 2. Workflows Catalog

### 2.1. Frontend Pipeline (`frontend-ci.yml`)
- **Triggers**: On push / PR modifying `frontend/**`.
- **Validation Steps**:
  1. Node.js 22 environment setup with npm cache.
  2. Dependency installation (`npm ci`).
  3. ESLint enforcement (`npm run lint`).
  4. Strict TypeScript type check (`tsc --noEmit`).
  5. Jest unit testing (`npm test`).
  6. Next.js production build (`npm run build`).

### 2.2. Backend Pipeline (`backend-ci.yml`)
- **Triggers**: On push / PR modifying `backend/**`.
- **Validation Steps**:
  1. Spin up live PostgreSQL 16 & Redis 7 test service containers.
  2. Node.js 22 environment setup.
  3. Dependency installation (`npm ci`).
  4. Prisma Client generation against test database schema.
  5. ESLint code cleanliness checks.
  6. Jest unit & e2e execution.
  7. Production NestJS compilation (`npm run build`).

### 2.3. AI Service Pipeline (`ai-service-ci.yml`)
- **Triggers**: On push / PR modifying `ai-service/**`.
- **Validation Steps**:
  1. Python 3.11 environment setup with pip cache.
  2. Installation of production & development dependencies (`requirements-dev.txt`).
  3. **Ruff** linting check (`ruff check .`).
  4. **Ruff** formatting compliance check (`ruff format --check .`).
  5. **Pytest** execution across all test fixtures.

### 2.4. Docker Validation (`docker-build.yml`)
- **Triggers**: On push to `main` branch or PR affecting Dockerfiles or `docker-compose.yml`.
- **Validation Steps**: Validates multi-stage Docker builds without pushing images, ensuring build repeatability.

---

## 3. Branch Protection Recommendations

To protect the `main` and `develop` branches:
- Require status checks to pass before merging:
  - `build-and-test` (Frontend)
  - `test-and-build` (Backend)
  - `lint-and-test` (AI Service)
- Require at least 1 approving pull request review.
- Enforce linear git history (squash or rebase merging).
