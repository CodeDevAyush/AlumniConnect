Write-Host "🌱 Executing Prisma Migrations and Seed..." -ForegroundColor Cyan
cd backend
npx prisma migrate dev --name init_schema
npx ts-node prisma/seed.ts
cd ..
Write-Host "✅ Database migrated and seeded successfully!" -ForegroundColor Green
