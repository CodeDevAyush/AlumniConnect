import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { AiClientService } from '../ai-client/ai-client.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prototypeStore: InMemoryPrototypeStore,
    private readonly aiClient: AiClientService,
  ) {}

  async searchAlumni(params: { department?: string; company?: string; skills?: string[] }) {
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      const all = this.prototypeStore.getAlumniList();
      return all.filter((alumni) => {
        if (params.company && !alumni.company.toLowerCase().includes(params.company.toLowerCase())) {
          return false;
        }
        if (params.department && !alumni.department.toLowerCase().includes(params.department.toLowerCase())) {
          return false;
        }
        return true;
      });
    }

    try {
      const dbAlumni = await this.prisma.profile.findMany({
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

      if (dbAlumni.length > 0) return dbAlumni;
      return this.prototypeStore.getAlumniList();
    } catch {
      return this.prototypeStore.getAlumniList();
    }
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
