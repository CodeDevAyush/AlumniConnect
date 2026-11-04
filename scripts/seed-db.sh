#!/usr/bin/env bash
set -e

echo "🌱 Executing Prisma Migrations and Seed..."
cd backend
npx prisma migrate dev --name init_schema
npx ts-node prisma/seed.ts
cd ..
echo "✅ Database migrated and seeded successfully!"
