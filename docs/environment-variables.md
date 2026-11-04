# Environment Variables Documentation

This document describes all environment variables used across the AlumniConnect monorepo.

> **Security Rule**: Never commit `.env` or files containing live credentials, passwords, or cryptographic secrets to version control.

---

## 1. Main Backend (`backend/.env`)

| Variable | Requirement | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Mandatory** | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | **Mandatory** | Port the HTTP NestJS server binds to | `4000` |
| `API_PREFIX` | Optional | Routing prefix for all REST endpoints | `api/v1` |
| `DATABASE_URL` | **Mandatory** | PostgreSQL connection URI for Prisma ORM | `postgresql://user:pass@localhost:5432/alumniconnect_db` |
| `REDIS_HOST` | **Mandatory** | Redis cache & broker host | `localhost` |
| `REDIS_PORT` | **Mandatory** | Redis port | `6379` |
| `REDIS_PASSWORD` | Optional | Redis password if auth is enabled | `(empty)` |
| `REDIS_DB` | Optional | Redis database index | `0` |
| `JWT_ACCESS_SECRET` | **Mandatory** | Cryptographic key for signing JWT access tokens (min 32 chars) | `dev_jwt_access_secret_...` |
| `JWT_REFRESH_SECRET`| **Mandatory** | Cryptographic key for signing JWT refresh tokens | `dev_jwt_refresh_secret_...` |
| `JWT_ACCESS_EXPIRES_IN` | Optional | Expiration timeframe for access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN`| Optional | Expiration timeframe for refresh token | `7d` |
| `INTERNAL_API_SECRET_KEY` | **Mandatory** | Shared secret key sent in `X-Internal-API-Key` to FastAPI | `dev_internal_shared_secret_...` |
| `AI_SERVICE_URL` | **Mandatory** | Internal HTTP endpoint for Python AI service | `http://localhost:8000` |
| `CORS_ORIGINS` | **Mandatory** | Comma-separated list of allowed web origins | `http://localhost:3000` |

---

## 2. AI / ML Service (`ai-service/.env`)

| Variable | Requirement | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | **Mandatory** | Environment mode | `development` |
| `AI_SERVICE_HOST` | **Mandatory** | Bind address | `0.0.0.0` |
| `AI_SERVICE_PORT` | **Mandatory** | Port number | `8000` |
| `AI_SERVICE_LOG_LEVEL` | Optional | Logging level (`debug`, `info`, `warning`, `error`) | `info` |
| `INTERNAL_API_SECRET_KEY` | **Mandatory** | Must match backend's key for authentication validation | `dev_internal_shared_secret_...` |
| `CORS_ORIGINS` | Optional | Allowed CORS origins | `http://localhost:3000,http://localhost:4000` |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Optional | Token for querying GitHub API without strict rate limits | `ghp_...` |
| `OPENAI_API_KEY` | Optional | API key for OpenAI LLM services | `sk-...` |
| `GEMINI_API_KEY` | Optional | API key for Google Gemini model access | `AIza...` |
| `MODEL_CACHE_DIR` | Optional | Path to local scikit-learn/ML model weights | `./app/models/weights` |

---

## 3. Frontend (`frontend/.env.local`)

| Variable | Requirement | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Mandatory** | Public REST API base URL accessible from user browser | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_WS_URL` | **Mandatory** | WebSocket server endpoint for real-time chat & alerts | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_NAME` | Optional | Brand title | `AlumniConnect` |
| `NEXT_PUBLIC_APP_TAGLINE` | Optional | Brand subtitle | `Your Campus Network, Activated.` |
