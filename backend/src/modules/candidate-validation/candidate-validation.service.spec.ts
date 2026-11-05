import { CandidateAssessmentStatus, CodingPlatform } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { CandidateValidationService } from './candidate-validation.service';

const profile = {
  id: 'profile-1',
  userId: 'user-1',
  githubUsername: 'sample-user',
  codingPlatform: CodingPlatform.CODEFORCES,
  codingHandle: 'sample-handle',
  consentAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

function response(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('CandidateValidationService', () => {
  let service: CandidateValidationService;
  let prototypeStore: InMemoryPrototypeStore;
  let prisma: {
    candidateValidationProfile: { findUnique: jest.Mock };
    candidateAssessment: { create: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      candidateValidationProfile: { findUnique: jest.fn().mockResolvedValue(profile) },
      candidateAssessment: {
        create: jest.fn(({ data }) =>
          Promise.resolve({ id: 'assessment-1', ...data, assessedAt: new Date() }),
        ),
      },
    };
    prototypeStore = new InMemoryPrototypeStore();
    service = new CandidateValidationService(prisma as unknown as PrismaService, prototypeStore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an explainable scored assessment for GitHub and Codeforces evidence', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const recent = new Date().toISOString();
    const submissions = Array.from({ length: 50 }, (_, index) => ({
      verdict: 'OK',
      problem: { contestId: index + 1, index: 'A', name: `Problem ${index}` },
    }));

    fetchMock
      .mockResolvedValueOnce(response({ bio: 'Software developer', public_repos: 3 }))
      .mockResolvedValueOnce(
        response([
          { description: 'One', pushed_at: recent },
          { description: 'Two', pushed_at: recent },
          { description: 'Three', pushed_at: recent },
        ]),
      )
      .mockResolvedValueOnce(response({ status: 'OK', result: [{ rating: 1400 }] }))
      .mockResolvedValueOnce(response({ status: 'OK', result: submissions }))
      .mockResolvedValueOnce(
        response({
          status: 'OK',
          result: Array.from({ length: 5 }, (_, index) => ({
            contestId: index + 1,
            ratingUpdateTimeSeconds: 1,
          })),
        }),
      );

    const result = await service.assess('user-1');

    expect(result.score).toBe(80);
    expect(result.githubScore).toBe(40);
    expect(result.codingScore).toBe(30);
    expect(result.evidenceQualityScore).toBe(10);
    expect(result.status).toBe(CandidateAssessmentStatus.READY_FOR_REVIEW);
    expect(result.ownershipVerified).toBe(false);
    expect(prisma.candidateAssessment.create).toHaveBeenCalledTimes(1);
  });

  it('does not infer a score for unsupported coding platforms', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue({
      ...profile,
      codingPlatform: CodingPlatform.LEETCODE,
    });
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]));

    const result = await service.assess('user-1');

    expect(result.score).toBeNull();
    expect(result.codingScore).toBeNull();
    expect(result.status).toBe(CandidateAssessmentStatus.MANUAL_REVIEW);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('requires a saved profile before assessment', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue(null);

    await expect(service.assess('user-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('saves profiles, assessments, and deletion in memory without calling Prisma', async () => {
    const previousMode = process.env.PROTOTYPE_IN_MEMORY;
    process.env.PROTOTYPE_IN_MEMORY = 'true';
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ status: 'OK', result: [{ rating: 0 }] }))
      .mockResolvedValueOnce(response({ status: 'OK', result: [] }))
      .mockResolvedValueOnce(response({ status: 'OK', result: [] }));

    try {
      await service.saveProfile('user-1', {
        githubUsername: 'sample-user',
        codingPlatform: CodingPlatform.CODEFORCES,
        codingHandle: 'sample-handle',
        consent: true,
      });
      const assessment = await service.assess('user-1');
      const saved = await service.getMine('user-1');

      expect(assessment.score).toBe(10);
      expect(saved?.assessments).toHaveLength(1);
      expect(prisma.candidateValidationProfile.findUnique).not.toHaveBeenCalled();
      expect(prisma.candidateAssessment.create).not.toHaveBeenCalled();
      expect(await service.deleteProfile('user-1')).toEqual({ deleted: true });
      expect(await service.getMine('user-1')).toBeNull();
    } finally {
      if (previousMode === undefined) delete process.env.PROTOTYPE_IN_MEMORY;
      else process.env.PROTOTYPE_IN_MEMORY = previousMode;
    }
  });
});
