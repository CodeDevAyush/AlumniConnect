# ==============================================================================
# AlumniConnect - Development Stack Launcher (PowerShell)
# Starts FastAPI (AI/ML), NestJS (Core Backend), and Next.js (Frontend)
# ==============================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  Starting AlumniConnect Full Stack..." -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# 1. Start AI/ML Microservice (FastAPI on Port 8000)
Write-Host "[1/3] Launching AI/ML Intelligence Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\ai-service'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 2. Start Core Backend (NestJS on Port 4000)
Write-Host "[2/3] Launching Main Backend Service (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; npm.cmd run start:dev"

# 3. Start Frontend Client (Next.js on Port 3000)
Write-Host "[3/3] Launching Frontend Client (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:NEXT_IGNORE_INCORRECT_LOCKFILE='1'; cd '$Root\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "All 3 services have been launched in separate terminal windows!" -ForegroundColor Green
Write-Host "-------------------------------------------------------------------"
Write-Host "  - Frontend Application : http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Core Backend API     : http://localhost:4000/api/v1" -ForegroundColor Cyan
Write-Host "  - Swagger OpenAPI Docs : http://localhost:4000/api/docs" -ForegroundColor Cyan
Write-Host "  - AI Microservice API  : http://localhost:8000/api/v1/health" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------------------"

