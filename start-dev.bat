@echo off
title AlumniConnect Launcher
echo ===================================================================
echo   Starting AlumniConnect Full Stack (All 3 Services)
echo ===================================================================

echo [1/3] Launching AI Intelligence Microservice (Port 8000)...
start "AlumniConnect - AI Service (8000)" cmd /k "cd ai-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Launching Core Backend Service (Port 4000)...
start "AlumniConnect - Backend (4000)" cmd /k "cd backend && npm.cmd run start:dev"

echo [3/3] Launching Frontend Client (Port 3000)...
start "AlumniConnect - Frontend (3000)" cmd /k "cd frontend && set NEXT_IGNORE_INCORRECT_LOCKFILE=1 && npm.cmd run dev"

echo.
echo ===================================================================
echo All services launched in their respective console windows:
echo   - Frontend:    http://localhost:3000
echo   - Backend:     http://localhost:4000/api/v1
echo   - Swagger API: http://localhost:4000/api/docs
echo   - AI Service:  http://localhost:8000/api/v1/health
echo ===================================================================
pause

