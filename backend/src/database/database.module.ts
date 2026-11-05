import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { InMemoryPrototypeStore } from './in-memory-prototype.store';

@Global()
@Module({
  providers: [PrismaService, InMemoryPrototypeStore],
  exports: [PrismaService, InMemoryPrototypeStore],
})
export class DatabaseModule {}
