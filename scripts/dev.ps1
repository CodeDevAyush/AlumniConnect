Write-Host "🚀 Starting AlumniConnect Local Development Environment..." -ForegroundColor Cyan

# Check if Docker is available
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "📦 Starting infrastructure containers (PostgreSQL & Redis)..." -ForegroundColor Yellow
    docker-compose up -d postgres redis
    Write-Host "✅ PostgreSQL & Redis are running!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Docker Compose not found. Please ensure local PostgreSQL and Redis are running." -ForegroundColor Yellow
}

Write-Host "💡 To start individual applications:" -ForegroundColor Cyan
Write-Host "   Frontend:   cd frontend   && npm run dev"
Write-Host "   Backend:    cd backend    && npm run start:dev"
Write-Host "   AI Service: cd ai-service && uvicorn app.main:app --reload --port 8000"
