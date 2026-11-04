import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive() {
    return this.prisma.opportunity.findMany({
      where: { isActive: true },
      include: {
        author: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
