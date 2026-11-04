#!/usr/bin/env bash
set -e

echo "🧪 Running AlumniConnect Test Suite Across Monorepo..."

echo "1️⃣ Backend Tests (NestJS / Jest)..."
cd backend && npm test -- --passWithNoTests && cd ..

echo "2️⃣ Frontend Tests (Next.js / Jest)..."
cd frontend && npm test -- --passWithNoTests && cd ..

echo "3️⃣ AI Service Tests (FastAPI / Pytest)..."
cd ai-service && pytest && cd ..

echo "✅ All test suites executed successfully!"
