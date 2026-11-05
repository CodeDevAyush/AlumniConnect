import { CandidateAssessmentStatus, CodingPlatform } from '@prisma/client';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
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
    delete process.env.PROTOTYPE_IN_MEMORY;
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

  it('does not infer a score for platforms without automated evidence support', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue({
      ...profile,
      codingPlatform: CodingPlatform.HACKERRANK,
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

  it('scores LeetCode solved counts by difficulty and reports submission acceptance rates', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue({
      ...profile,
      codingPlatform: CodingPlatform.LEETCODE,
    });
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(
        response({
          data: {
            matchedUser: {
              submitStats: {
                acSubmissionNum: [
                  { difficulty: 'Easy', count: 75, submissions: 100 },
                  { difficulty: 'Medium', count: 40, submissions: 80 },
                  { difficulty: 'Hard', count: 10, submissions: 20 },
                ],
                totalSubmissionNum: [
                  { difficulty: 'Easy', submissions: 200 },
                  { difficulty: 'Medium', submissions: 200 },
                  { difficulty: 'Hard', submissions: 100 },
                ],
              },
            },
          },
        }),
      );

    const result = await service.assess('user-1');

    expect(result.codingScore).toBe(43);
    expect(result.score).toBe(53);
    expect(result.evidence).toMatchObject({
      codingProfile: {
        platform: 'LEETCODE',
        difficultyStats: {
          Easy: { solved: 75, acceptanceRate: 50 },
          Medium: { acceptanceRate: 40 },
          Hard: { acceptanceRate: 20 },
        },
        scoreBreakdown: {
          easySolved: 5,
          mediumSolved: 12,
          hardSolved: 25,
          acceptanceRateBonus: 1,
        },
      },
    });
    expect(fetchMock.mock.calls[2][0]).toBe('https://leetcode.com/graphql/');
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'POST' });
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body)).variables).toEqual({
      username: 'sample-handle',
    });
  });

  it('rewards hard problems more than a high acceptance rate', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue({
      ...profile,
      codingPlatform: CodingPlatform.LEETCODE,
    });
    const fetchMock = jest.spyOn(global, 'fetch');
    const leetCodeResponse = (
      solved: { Easy: number; Medium: number; Hard: number },
      acceptedSubmissions: { Easy: number; Medium: number; Hard: number },
      totalSubmissions: { Easy: number; Medium: number; Hard: number },
    ) =>
      response({
        data: {
          matchedUser: {
            submitStats: {
              acSubmissionNum: (['Easy', 'Medium', 'Hard'] as const).map((difficulty) => ({
                difficulty,
                count: solved[difficulty],
                submissions: acceptedSubmissions[difficulty],
              })),
              totalSubmissionNum: (['Easy', 'Medium', 'Hard'] as const).map((difficulty) => ({
                difficulty,
                submissions: totalSubmissions[difficulty],
              })),
            },
          },
        },
      });

    fetchMock
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(
        leetCodeResponse(
          { Easy: 0, Medium: 0, Hard: 10 },
          { Easy: 0, Medium: 0, Hard: 10 },
          { Easy: 10, Medium: 10, Hard: 100 },
        ),
      )
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(
        leetCodeResponse(
          { Easy: 0, Medium: 0, Hard: 0 },
          { Easy: 90, Medium: 90, Hard: 90 },
          { Easy: 100, Medium: 100, Hard: 100 },
        ),
      );

    const hardFocused = await service.assess('user-1');
    const highAcceptance = await service.assess('user-1');

    expect(hardFocused.codingScore).toBe(25);
    expect(highAcceptance.codingScore).toBe(3);
    expect(hardFocused.codingScore).toBeGreaterThan(highAcceptance.codingScore!);
  });

  it('fails explicitly when LeetCode does not return public profile statistics', async () => {
    prisma.candidateValidationProfile.findUnique.mockResolvedValue({
      ...profile,
      codingPlatform: CodingPlatform.LEETCODE,
    });
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(response({ bio: null, public_repos: 0 }))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(
        response({
          errors: [{ message: 'Public profile statistics are temporarily unavailable' }],
        }),
      );

    await expect(service.assess('user-1')).rejects.toBeInstanceOf(BadGatewayException);
    expect(prisma.candidateAssessment.create).not.toHaveBeenCalled();
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
