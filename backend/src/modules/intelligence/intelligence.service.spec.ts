import { Test, TestingModule } from '@nestjs/testing';
import { IntelligenceService } from './intelligence.service';
import { AiClientService } from '../ai-client/ai-client.service';
import { PrismaService } from '../../database/prisma.service';

describe('IntelligenceService', () => {
  let service: IntelligenceService;
  let aiClient: AiClientService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligenceService,
        {
          provide: AiClientService,
          useValue: {
            getAvailableTracks: jest.fn().mockResolvedValue({
              tracks: ['SDE', 'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Analyst', 'Data Engineer', 'CP'],
            }),
            assessStudentCapability: jest.fn().mockResolvedValue({
              success: true,
              studentId: 'student-123',
              track: 'SDE',
              compositeScore: 78.5,
              dimensions: {
                codingPerformance: { score: 80 },
                developmentCapability: { score: 75 },
                technicalFundamentals: { score: 78 },
                practicalApplication: { score: 82 },
                consistencyGrowth: { score: 77 },
              },
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn().mockResolvedValue({
                userId: 'student-123',
                skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
                studentProfile: { githubUsername: 'testdev' },
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<IntelligenceService>(IntelligenceService);
    aiClient = module.get<AiClientService>(AiClientService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should fetch available tracks from AI microservice', async () => {
    const res = await service.getTracks();
    expect(res.tracks).toHaveLength(8);
    expect(res.tracks).toContain('SDE');
  });

  it('should assess student capability and augment missing evidence from profile', async () => {
    const res = await service.assessStudent('student-123', { selectedTrack: 'SDE' });
    expect(res.success).toBe(true);
    expect(res.compositeScore).toBe(78.5);
    expect(aiClient.assessStudentCapability).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-123',
        selectedTrack: 'SDE',
        githubUsername: 'testdev',
        selfReportedSkills: ['TypeScript', 'Node.js', 'PostgreSQL'],
      }),
    );
  });
});
