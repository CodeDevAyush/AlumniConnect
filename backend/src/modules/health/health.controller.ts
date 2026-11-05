import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    let dbStatus = 'down';
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      dbStatus = 'in-memory';
    } else {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        dbStatus = 'up';
      } catch {
        dbStatus = 'disconnected';
      }
    }

    return {
      status: 'ok',
      service: 'alumniconnect-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
