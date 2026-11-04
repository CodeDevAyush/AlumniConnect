Write-Host "🔍 Running Linters & Format Checks across Monorepo..." -ForegroundColor Cyan

Write-Host "1️⃣ Backend ESLint..." -ForegroundColor Yellow
cd backend
npm run lint
cd ..

Write-Host "2️⃣ Frontend ESLint..." -ForegroundColor Yellow
cd frontend
npm run lint
cd ..

Write-Host "3️⃣ AI Service Ruff..." -ForegroundColor Yellow
cd ai-service
ruff check .
cd ..

Write-Host "✅ Linting check completed!" -ForegroundColor Green
