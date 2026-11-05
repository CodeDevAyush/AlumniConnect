import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CandidateAssessmentStatus, CodingPlatform, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { ProjectEvalService } from '../project-eval/project-eval.service';
import { SaveValidationProfileDto } from './dto/save-validation-profile.dto';

type GitHubUser = {
  bio: string | null;
  public_repos: number;
};

type GitHubRepository = {
  description: string | null;
  pushed_at: string | null;
};

type CodeforcesUser = {
  rating?: number;
};

type CodeforcesSubmission = {
  verdict?: string;
  problem?: { contestId?: number; index?: string; name?: string };
};

type CodeforcesContest = {
  contestId: number;
  ratingUpdateTimeSeconds: number;
};

type LeetCodeDifficulty = 'Easy' | 'Medium' | 'Hard';

type LeetCodeDifficultyStats = {
  solved: number;
  acceptedSubmissions: number;
  totalSubmissions: number;
  acceptanceRate: number | null;
};

type LeetCodeStatsResponse = {
  data?: {
    matchedUser?: {
      submitStats?: {
        acSubmissionNum?: Array<{
          difficulty?: string;
          count?: number;
          submissions?: number;
        }>;
        totalSubmissionNum?: Array<{
          difficulty?: string;
          submissions?: number;
        }>;
      };
    } | null;
  };
  errors?: unknown[];
};

type GitHubEvidence = {
  publicRepositories: number;
  analyzedRepositories: number;
  recentlyUpdatedRepositories: number;
  repositoriesWithDescriptions: number;
  hasProfileBio: boolean;
  score: number;
};

type CodingEvidence =
  | {
      supported: true;
      platform: 'CODEFORCES';
      acceptedProblems: number;
      contests: number;
      rating: number | null;
      score: number;
    }
  | {
      supported: true;
      platform: 'LEETCODE';
      difficultyStats: Record<LeetCodeDifficulty, LeetCodeDifficultyStats>;
      weightedAcceptanceRate: number | null;
      scoreBreakdown: {
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        acceptanceRateBonus: number;
      };
      score: number;
    }
  | {
      supported: false;
      platform: CodingPlatform;
      reason: string;
    };

const SCORE_WEIGHTS = {
  github: 45,
  codingProfile: 45,
  evidenceQuality: 10,
};

@Injectable()
export class CandidateValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prototypeStore: InMemoryPrototypeStore,
    private readonly projectEvalService?: ProjectEvalService,
  ) {}

  private isInMemoryActive(): boolean {
    return process.env.PROTOTYPE_IN_MEMORY === 'true';
  }

  async getMine(userId: string) {
    if (this.isInMemoryActive()) {
      return this.prototypeStore.getValidationProfileWithLatestAssessment(userId) ?? null;
    }

    return this.prisma.candidateValidationProfile.findUnique({
      where: { userId },
      include: { assessments: { orderBy: { assessedAt: 'desc' }, take: 1 } },
    });
  }

  async saveProfile(userId: string, dto: SaveValidationProfileDto) {
    if (!dto.consent) {
      throw new BadRequestException('Consent is required before public profile data is assessed');
    }

    if (this.isInMemoryActive() || process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return this.prototypeStore.saveValidationProfile(userId, {
        githubUsername: dto.githubUsername.trim(),
        topRepoUrl: dto.topRepoUrl?.trim(),
        codingPlatform: dto.codingPlatform,
        codingHandle: dto.codingHandle.trim(),
      });
    }

    return this.prisma.candidateValidationProfile.upsert({
      where: { userId },
      create: {
        userId,
        githubUsername: dto.githubUsername.trim(),
        codingPlatform: dto.codingPlatform,
        codingHandle: dto.codingHandle.trim(),
        consentAt: new Date(),
      },
      update: {
        githubUsername: dto.githubUsername.trim(),
        codingPlatform: dto.codingPlatform,
        codingHandle: dto.codingHandle.trim(),
        consentAt: new Date(),
      },
    });
  }

  async deleteProfile(userId: string) {
    if (this.isInMemoryActive()) {
      return { deleted: this.prototypeStore.deleteValidationProfile(userId) };
    }

    const result = await this.prisma.candidateValidationProfile.deleteMany({ where: { userId } });
    return { deleted: result.count > 0 };
  }

  async assess(userId: string, topRepoUrl?: string) {
    const inMemory = this.isInMemoryActive();
    const profile = inMemory
      ? this.prototypeStore.getValidationProfile(userId)
      : await this.prisma.candidateValidationProfile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('Save your GitHub and coding profiles before assessment');
    }

    const github = await this.getGitHubEvidence(profile.githubUsername);
    const coding = await this.getCodingEvidence(profile.codingPlatform, profile.codingHandle);

    const evidenceQualityScore = coding.supported ? 10 : null;
    let score: number | null = null;
    let status: CandidateAssessmentStatus = CandidateAssessmentStatus.MANUAL_REVIEW;
    if (coding.supported) {
      score = github.score + coding.score + 10;
      status = this.statusForScore(score);
    }

    const evidence: Prisma.InputJsonObject = {
      assessedAt: new Date().toISOString(),
      weights: SCORE_WEIGHTS,
      github: {
        username: profile.githubUsername,
        ownershipVerified: false,
        publicRepositories: github.publicRepositories,
        analyzedRepositories: github.analyzedRepositories,
        recentlyUpdatedRepositories: github.recentlyUpdatedRepositories,
        repositoriesWithDescriptions: github.repositoriesWithDescriptions,
        hasProfileBio: github.hasProfileBio,
        scoreBreakdown: {
          repositoryCount: this.repositoryCountScore(github.publicRepositories),
          recentActivity: this.recentActivityScore(github.recentlyUpdatedRepositories),
          descriptions: this.descriptionScore(
            github.analyzedRepositories,
            github.repositoriesWithDescriptions,
          ),
          profileBio: github.hasProfileBio ? 5 : 0,
        },
      },
      codingProfile: coding,
      interpretation:
        'This is a preliminary readiness signal, not a judgment of a person or an automatic rejection decision.',
    };

    // Evaluate Top Project Code Quality
    const repoTarget = topRepoUrl?.trim() || (profile as any).topRepoUrl || '';
    let topProjectEvaluation: any = null;
    if (repoTarget && this.projectEvalService) {
      try {
        topProjectEvaluation = await this.projectEvalService.evaluate({ repoUrl: repoTarget });
      } catch (err: any) {
        topProjectEvaluation = {
          error: err.message || 'Evaluation error',
          repo: repoTarget,
        };
      }
    }

    // Persist full evaluation to server JSON file
    const storageDir = path.join(process.cwd(), 'storage', 'evaluations');
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true });
      } catch {
        // Continue
      }
    }
    const timestamp = Date.now();
    const storedJsonFilename = `evaluation_${userId}_${timestamp}.json`;
    const storedJsonPath = path.join(storageDir, storedJsonFilename);
    const latestPath = path.join(storageDir, `latest_${userId}.json`);

    const fullEvaluationJson = {
      studentId: userId,
      evaluatedAt: new Date().toISOString(),
      profile: {
        githubUsername: profile.githubUsername,
        codingPlatform: profile.codingPlatform,
        codingHandle: profile.codingHandle,
        topRepoUrl: repoTarget,
      },
      profileAssessment: {
        status,
        overallScore: score,
        githubScore: github.score,
        codingScore: coding.supported ? coding.score : null,
        evidenceQualityScore,
        evidence,
      },
      topProjectEvaluation,
      modelTrainingFeatures: topProjectEvaluation?.modelTrainingFeatures ?? null,
    };

    try {
      fs.writeFileSync(storedJsonPath, JSON.stringify(fullEvaluationJson, null, 2), 'utf-8');
      fs.writeFileSync(latestPath, JSON.stringify(fullEvaluationJson, null, 2), 'utf-8');
    } catch {
      // Continue
    }

    let assessment: any;
    if (inMemory) {
      assessment = this.prototypeStore.addAssessment({
        userId,
        profileId: profile.id,
        status,
        score,
        githubScore: github.score,
        codingScore: coding.supported ? coding.score : null,
        evidenceQualityScore,
        ownershipVerified: false,
        evidence,
        topProjectEvaluation,
        storedJsonFilename,
        storedJsonPath,
      });
    } else {
      assessment = await this.prisma.candidateAssessment.create({
        data: {
          userId,
          profileId: profile.id,
          status,
          score,
          githubScore: github.score,
          codingScore: coding.supported ? coding.score : null,
          evidenceQualityScore,
          ownershipVerified: false,
          evidence,
        },
      });
    }

    return {
      ...assessment,
      topProjectEvaluation,
      storedJsonFilename,
      storedJsonPath,
    };
  }

  getLatestEvaluationFile(userId: string): { filename: string; content: string } | null {
    const latestPath = path.join(process.cwd(), 'storage', 'evaluations', `latest_${userId}.json`);
    if (fs.existsSync(latestPath)) {
      return {
        filename: `evaluation_${userId}.json`,
        content: fs.readFileSync(latestPath, 'utf-8'),
      };
    }
    return null;
  }

  private async getGitHubEvidence(username: string): Promise<GitHubEvidence> {
    const user = await this.fetchJson<GitHubUser>(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AlumniConnect-Candidate-Assessment',
      },
    );
    const repositories = await this.fetchJson<GitHubRepository[]>(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`,
      {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AlumniConnect-Candidate-Assessment',
      },
    );

    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const analyzedRepositories = Array.isArray(repositories) ? repositories.length : 0;
    const recentlyUpdatedRepositories = Array.isArray(repositories)
      ? repositories.filter((repository) => {
          if (!repository.pushed_at) return false;
          const pushed = new Date(repository.pushed_at).getTime();
          return now - pushed <= ninetyDays;
        }).length
      : 0;
    const repositoriesWithDescriptions = Array.isArray(repositories)
      ? repositories.filter(
          (repository) =>
            typeof repository.description === 'string' && repository.description.trim().length > 0,
        ).length
      : 0;
    const hasProfileBio = typeof user.bio === 'string' && user.bio.trim().length > 0;

    const score =
      this.repositoryCountScore(user.public_repos) +
      this.recentActivityScore(recentlyUpdatedRepositories) +
      this.descriptionScore(analyzedRepositories, repositoriesWithDescriptions) +
      (hasProfileBio ? 5 : 0);

    return {
      publicRepositories: user.public_repos,
      analyzedRepositories,
      recentlyUpdatedRepositories,
      repositoriesWithDescriptions,
      hasProfileBio,
      score,
    };
  }

  private async getCodingEvidence(
    platform: CodingPlatform,
    handle: string,
  ): Promise<CodingEvidence> {
    if (platform === 'CODEFORCES') {
      const users = await this.fetchJson<CodeforcesUser[]>(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
        { 'User-Agent': 'AlumniConnect-Candidate-Assessment' },
      );
      if (!users.length) {
        throw new NotFoundException(`Codeforces user ${handle} was not found`);
      }

      const submissions = await this.fetchJson<CodeforcesSubmission[]>(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&count=100`,
        { 'User-Agent': 'AlumniConnect-Candidate-Assessment' },
      );
      const rating = await this.fetchJson<CodeforcesContest[]>(
        `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`,
        { 'User-Agent': 'AlumniConnect-Candidate-Assessment' },
      );

      const accepted = new Set<string>();
      for (const submission of submissions) {
        if (submission.verdict === 'OK' && submission.problem) {
          const key = `${submission.problem.contestId ?? 'none'}-${
            submission.problem.index ?? submission.problem.name ?? 'unknown'
          }`;
          accepted.add(key);
        }
      }

      const acceptedCount = accepted.size;
      const contests = rating.length;
      const score =
        this.acceptedProblemScore(acceptedCount) +
        this.contestScore(contests) +
        this.ratingScore(users[0]?.rating);

      return {
        supported: true,
        platform: 'CODEFORCES',
        acceptedProblems: acceptedCount,
        contests,
        rating: users[0]?.rating ?? null,
        score,
      };
    }

    if (platform === 'LEETCODE') {
      const stats = await this.fetchLeetCodeStats(handle);
      const easyScore = this.leetCodeEasyScore(stats.Easy.solved);
      const mediumScore = this.leetCodeMediumScore(stats.Medium.solved);
      const hardScore = this.leetCodeHardScore(stats.Hard.solved);
      const allAccepted =
        stats.Easy.acceptedSubmissions +
        stats.Medium.acceptedSubmissions +
        stats.Hard.acceptedSubmissions;
      const allTotal =
        stats.Easy.totalSubmissions +
        stats.Medium.totalSubmissions +
        stats.Hard.totalSubmissions;
      const weightedAcceptanceRate =
        allTotal > 0 ? Number(((allAccepted / allTotal) * 100).toFixed(1)) : null;
      const acceptanceRateBonus = this.leetCodeAcceptanceBonus(weightedAcceptanceRate);
      const score = Math.min(easyScore + mediumScore + hardScore + acceptanceRateBonus, 45);

      return {
        supported: true,
        platform: 'LEETCODE',
        difficultyStats: stats,
        weightedAcceptanceRate,
        scoreBreakdown: {
          easySolved: easyScore,
          mediumSolved: mediumScore,
          hardSolved: hardScore,
          acceptanceRateBonus,
        },
        score,
      };
    }

    return {
      supported: false,
      platform,
      reason: `${platform} is saved for human review; no automated score is inferred`,
    };
  }

  private async fetchLeetCodeStats(
    handle: string,
  ): Promise<Record<LeetCodeDifficulty, LeetCodeDifficultyStats>> {
    const url = 'https://leetcode.com/graphql/';
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AlumniConnect-Candidate-Assessment',
        },
        body: JSON.stringify({
          query: `query candidateProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum { difficulty count submissions }
                totalSubmissionNum { difficulty submissions }
              }
            }
          }`,
          variables: { username: handle },
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        `Unable to retrieve public evidence from leetcode.com: ${
          error instanceof Error ? error.message : 'network request failed'
        }`,
      );
    }

    if (response.status === 403 || response.status === 429) {
      throw new ServiceUnavailableException(
        'LeetCode rate-limited or denied the public profile request; try again later',
      );
    }
    if (!response.ok) {
      throw new BadGatewayException(
        `LeetCode returned HTTP ${response.status} while retrieving public profile evidence`,
      );
    }

    let body: LeetCodeStatsResponse;
    try {
      body = (await response.json()) as LeetCodeStatsResponse;
    } catch {
      throw new BadGatewayException('LeetCode returned invalid JSON for public profile evidence');
    }
    if (typeof body !== 'object' || body === null) {
      throw new BadGatewayException('LeetCode returned an invalid public profile response');
    }
    if (body.errors?.length) {
      throw new BadGatewayException(
        'LeetCode could not provide profile statistics; verify the handle and retry',
      );
    }
    if (!body.data?.matchedUser) {
      throw new NotFoundException(`Public profile was not found for LeetCode user ${handle}`);
    }

    const acMap = new Map<string, { count: number; submissions: number }>();
    for (const item of body.data.matchedUser.submitStats?.acSubmissionNum ?? []) {
      if (item.difficulty && typeof item.count === 'number' && typeof item.submissions === 'number') {
        acMap.set(item.difficulty, {
          count: item.count,
          submissions: item.submissions,
        });
      }
    }

    const totalMap = new Map<string, number>();
    for (const item of body.data.matchedUser.submitStats?.totalSubmissionNum ?? []) {
      if (item.difficulty && typeof item.submissions === 'number') {
        totalMap.set(item.difficulty, item.submissions);
      }
    }

    const buildDifficulty = (difficulty: LeetCodeDifficulty): LeetCodeDifficultyStats => {
      const ac = acMap.get(difficulty) ?? { count: 0, submissions: 0 };
      const total = totalMap.get(difficulty) ?? 0;
      const acceptanceRate =
        total > 0 ? Number(((ac.submissions / total) * 100).toFixed(1)) : null;

      return {
        solved: ac.count,
        acceptedSubmissions: ac.submissions,
        totalSubmissions: total,
        acceptanceRate,
      };
    };

    return {
      Easy: buildDifficulty('Easy'),
      Medium: buildDifficulty('Medium'),
      Hard: buildDifficulty('Hard'),
    };
  }

  private async fetchJson<T>(url: string, headers: Record<string, string>): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    } catch (error) {
      throw new ServiceUnavailableException(
        `Unable to retrieve public evidence from ${new URL(url).hostname}: ${
          error instanceof Error ? error.message : 'network request failed'
        }`,
      );
    }

    if (response.status === 404) {
      throw new NotFoundException(`Public profile was not found at ${new URL(url).hostname}`);
    }
    if (response.status === 403 || response.status === 429) {
      throw new ServiceUnavailableException(
        `Public evidence provider ${new URL(url).hostname} rate-limited the request; try again later`,
      );
    }
    if (!response.ok) {
      throw new BadGatewayException(
        `Public evidence provider ${new URL(url).hostname} returned HTTP ${response.status}`,
      );
    }

    let body: { status?: string; comment?: string; result?: T } | T;
    try {
      body = (await response.json()) as { status?: string; comment?: string; result?: T } | T;
    } catch {
      throw new BadGatewayException(
        `Public evidence provider ${new URL(url).hostname} returned invalid JSON`,
      );
    }
    if (typeof body === 'object' && body !== null && 'status' in body && body.status !== 'OK') {
      throw new BadGatewayException(
        'The coding platform could not provide profile evidence; verify the handle and retry',
      );
    }
    if (typeof body === 'object' && body !== null && 'status' in body && 'result' in body) {
      return body.result as T;
    }
    return body as T;
  }

  private repositoryCountScore(count: number) {
    if (count >= 6) return 15;
    if (count >= 3) return 10;
    if (count >= 1) return 5;
    return 0;
  }

  private recentActivityScore(count: number) {
    if (count >= 3) return 15;
    if (count >= 2) return 10;
    if (count >= 1) return 5;
    return 0;
  }

  private descriptionScore(repositoryCount: number, describedCount: number) {
    if (repositoryCount === 0) return 0;
    const coverage = describedCount / repositoryCount;
    if (coverage >= 0.8) return 10;
    if (coverage >= 0.4) return 5;
    return 0;
  }

  private acceptedProblemScore(count: number) {
    if (count >= 150) return 15;
    if (count >= 50) return 10;
    if (count >= 10) return 5;
    return 0;
  }

  private ratingScore(rating?: number) {
    if (!rating || rating < 1200) return 0;
    if (rating >= 1700) return 15;
    if (rating >= 1400) return 10;
    return 5;
  }

  private contestScore(count: number) {
    if (count >= 15) return 15;
    if (count >= 5) return 10;
    if (count >= 1) return 5;
    return 0;
  }

  private leetCodeEasyScore(count: number) {
    if (count >= 75) return 5;
    if (count >= 25) return 3;
    if (count >= 1) return 1;
    return 0;
  }

  private leetCodeMediumScore(count: number) {
    if (count >= 40) return 12;
    if (count >= 10) return 8;
    if (count >= 1) return 4;
    return 0;
  }

  private leetCodeHardScore(count: number) {
    if (count >= 10) return 25;
    if (count >= 3) return 15;
    if (count >= 1) return 8;
    return 0;
  }

  private leetCodeAcceptanceBonus(rate: number | null) {
    if (rate === null) return 0;
    if (rate >= 80) return 3;
    if (rate >= 60) return 2;
    if (rate >= 40) return 1;
    return 0;
  }

  private statusForScore(score: number): CandidateAssessmentStatus {
    if (score >= 75) return CandidateAssessmentStatus.READY_FOR_REVIEW;
    if (score >= 55) return CandidateAssessmentStatus.DEVELOPING;
    return CandidateAssessmentStatus.NEEDS_MORE_EVIDENCE;
  }
}
