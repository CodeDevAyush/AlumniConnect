import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      ...(process.env.PROTOTYPE_IN_MEMORY === 'true'
        ? { datasourceUrl: 'postgresql://prototype:prototype@127.0.0.1:5432/prototype' }
        : {}),
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });
  }

  async onModuleInit() {
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      this.logger.warn(
        'PostgreSQL connection skipped: development in-memory prototype mode is active',
      );
      return;
    }

    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to PostgreSQL via Prisma ORM');
    } catch (error) {
      this.logger.error('❌ Failed to connect to PostgreSQL database', error);
      // Non-fatal on cold starts if DB is still coming up
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected gracefully');
  }
}
