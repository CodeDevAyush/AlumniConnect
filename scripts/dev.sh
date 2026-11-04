#!/usr/bin/env bash
set -e

echo "🚀 Starting AlumniConnect Local Development Environment..."

if command -v docker-compose &> /dev/null; then
    echo "📦 Starting infrastructure containers (PostgreSQL & Redis)..."
    docker-compose up -d postgres redis
    echo "✅ PostgreSQL & Redis are running!"
else
    echo "⚠️ Docker Compose not found. Please ensure local PostgreSQL and Redis are running."
fi

echo "💡 To start individual applications:"
echo "   Frontend:   cd frontend   && npm run dev"
echo "   Backend:    cd backend    && npm run start:dev"
echo "   AI Service: cd ai-service && uvicorn app.main:app --reload --port 8000"
