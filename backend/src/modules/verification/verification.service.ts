import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingRequests() {
    return this.prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { include: { profile: true } } },
    });
  }
}
