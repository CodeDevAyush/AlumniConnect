#!/usr/bin/env bash
set -e

echo "🔍 Running Linters & Format Checks across Monorepo..."

echo "1️⃣ Backend ESLint..."
cd backend && npm run lint && cd ..

echo "2️⃣ Frontend ESLint..."
cd frontend && npm run lint && cd ..

echo "3️⃣ AI Service Ruff..."
cd ai-service && ruff check . && cd ..

echo "✅ Linting check completed!"
