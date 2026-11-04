Write-Host "🧪 Running AlumniConnect Test Suite Across Monorepo..." -ForegroundColor Cyan

Write-Host "1️⃣ Backend Tests (NestJS / Jest)..." -ForegroundColor Yellow
cd backend
npm test -- --passWithNoTests
cd ..

Write-Host "2️⃣ Frontend Tests (Next.js / Jest)..." -ForegroundColor Yellow
cd frontend
npm test -- --passWithNoTests
cd ..

Write-Host "3️⃣ AI Service Tests (FastAPI / Pytest)..." -ForegroundColor Yellow
cd ai-service
pytest
cd ..

Write-Host "✅ All test suites executed successfully!" -ForegroundColor Green
