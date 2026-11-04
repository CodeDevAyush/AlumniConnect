import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiClientService } from '../ai-client/ai-client.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClient: AiClientService,
  ) {}

  async searchAlumni(params: { department?: string; company?: string; skills?: string[] }) {
    return this.prisma.profile.findMany({
      where: {
        department: params.department ? { contains: params.department, mode: 'insensitive' } : undefined,
        alumniProfile: params.company ? { currentCompany: { contains: params.company, mode: 'insensitive' } } : { isNot: null },
      },
      include: {
        alumniProfile: true,
        user: { select: { id: true, email: true, role: true, status: true } },
      },
      take: 20,
    });
  }

  async getAiRecommendations(studentId: string, skills: string[], targetRoles: string[]) {
    return this.aiClient.matchAlumni({
      studentId,
      skills,
      interests: [],
      targetRoles,
    });
  }
}
