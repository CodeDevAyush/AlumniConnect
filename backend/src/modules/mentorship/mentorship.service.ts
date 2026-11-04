import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MentorshipService {
  constructor(private readonly prisma: PrismaService) {}

  async listRequests(userId: string) {
    return this.prisma.mentorshipRequest.findMany({
      where: {
        OR: [{ studentId: userId }, { alumniId: userId }],
      },
      include: {
        student: { include: { profile: true } },
        alumni: { include: { profile: true } },
      },
    });
  }
}
