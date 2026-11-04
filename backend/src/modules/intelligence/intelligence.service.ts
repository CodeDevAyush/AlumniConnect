import { Injectable, Logger } from '@nestjs/common';
import { AiClientService, StudentEvidencePayload, JobDescriptionAnalysisRequest, ProjectSubmissionPayload, CareerGuidanceRequest } from '../ai-client/ai-client.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    private readonly aiClient: AiClientService,
    private readonly prisma: PrismaService,
  ) {}

  async getTracks() {
    return this.aiClient.getAvailableTracks();
  }

  async assessStudent(userId: string, payload: Partial<StudentEvidencePayload>) {
    // Fetch user profile from database to augment evidence if missing
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { studentProfile: true },
    });

    const evidence: StudentEvidencePayload = {
      studentId: userId,
      selectedTrack: payload.selectedTrack || 'SDE',
      selfReportedSkills: payload.selfReportedSkills || profile?.skills || [],
      githubUsername: payload.githubUsername || profile?.studentProfile?.githubUsername || profile?.githubUrl?.split('/').pop(),
      leetcodeUsername: payload.leetcodeUsername,
      codeforcesHandle: payload.codeforcesHandle,
      internalAssessments: payload.internalAssessments || [],
      manualProjects: payload.manualProjects || [],
    };

    return this.aiClient.assessStudentCapability(evidence);
  }

  async analyzeSkillGap(userId: string, payload: JobDescriptionAnalysisRequest) {
    if (!payload.studentSkills || payload.studentSkills.length === 0) {
      const profile = await this.prisma.profile.findUnique({ where: { userId } });
      if (profile && profile.skills) {
        payload.studentSkills = profile.skills;
      }
    }
    payload.studentId = userId;
    return this.aiClient.analyzeSkillGap(payload);
  }

  async analyzeCoding(userId: string, payload: { leetcodeUsername?: string; codeforcesHandle?: string }) {
    return this.aiClient.analyzeCodingProfiles({ studentId: userId, ...payload });
  }

  async evaluateProject(payload: ProjectSubmissionPayload) {
    return this.aiClient.evaluateProjectSubmission(payload);
  }

  async getCareerGuidance(userId: string, payload: Partial<CareerGuidanceRequest>) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const guidanceReq: CareerGuidanceRequest = {
      studentId: userId,
      targetRole: payload.targetRole || 'Software Development Engineer',
      skills: payload.skills || profile?.skills || [],
      currentYear: payload.currentYear || 3,
    };
    return this.aiClient.getCareerGuidance(guidanceReq);
  }

  async matchAlumni(userId: string, params: { topK?: number; targetRoles?: string[] }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { studentProfile: true },
    });

    const skills = profile?.skills || [];
    const targetRoles = params.targetRoles || profile?.studentProfile?.targetRoles || ['Software Engineer'];

    return this.aiClient.matchAlumni({
      studentId: userId,
      skills,
      interests: profile?.interests || [],
      targetRoles,
      topK: params.topK || 5,
    });
  }
}

