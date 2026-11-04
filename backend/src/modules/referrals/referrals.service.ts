import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWillingAlumni(company?: string) {
    return this.prisma.alumniProfile.findMany({
      where: {
        willingToRefer: true,
        currentCompany: company ? { contains: company, mode: 'insensitive' } : undefined,
      },
      include: {
        profile: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
  }
}
