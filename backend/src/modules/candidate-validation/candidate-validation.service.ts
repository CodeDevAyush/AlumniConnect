import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CandidateAssessmentStatus, CodingPlatform, Prisma } from '@prisma/client';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
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
  ) {}

  async getMine(userId: string) {
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
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

    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return this.prototypeStore.saveValidationProfile(userId, {
        githubUsername: dto.githubUsername.trim(),
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
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return { deleted: this.prototypeStore.deleteValidationProfile(userId) };
    }

    const result = await this.prisma.candidateValidationProfile.deleteMany({ where: { userId } });
    return { deleted: result.count > 0 };
  }

  async assess(userId: string) {
    const profile =
      process.env.PROTOTYPE_IN_MEMORY === 'true'
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

    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return this.prototypeStore.addAssessment({
        userId,
        profileId: profile.id,
        status,
        score,
        githubScore: github.score,
        codingScore: coding.supported ? coding.score : null,
        evidenceQualityScore,
        ownershipVerified: false,
        evidence,
      });
    }

    const assessment = await this.prisma.candidateAssessment.create({
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

    return assessment;
  }

  private async getGitHubEvidence(username: string): Promise<GitHubEvidence> {
    const user = await this.getJson<GitHubUser>(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        accept: 'application/vnd.github+json',
      },
    );
    const repositories = await this.getJson<GitHubRepository[]>(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { accept: 'application/vnd.github+json' },
    );
    const recentCutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const recentlyUpdatedRepositories = repositories.filter(
      (repository) =>
        repository.pushed_at !== null && Date.parse(repository.pushed_at) >= recentCutoff,
    ).length;
    const repositoriesWithDescriptions = repositories.filter((repository) =>
      Boolean(repository.description?.trim()),
    ).length;

    return {
      publicRepositories: user.public_repos,
      analyzedRepositories: repositories.length,
      recentlyUpdatedRepositories,
      repositoriesWithDescriptions,
      hasProfileBio: Boolean(user.bio?.trim()),
      score:
        this.repositoryCountScore(user.public_repos) +
        this.recentActivityScore(recentlyUpdatedRepositories) +
        this.descriptionScore(repositories.length, repositoriesWithDescriptions) +
        (user.bio?.trim() ? 5 : 0),
    };
  }

  private async getCodingEvidence(
    platform: CodingPlatform,
    handle: string,
  ): Promise<CodingEvidence> {
    if (platform === CodingPlatform.LEETCODE) {
      return this.getLeetCodeEvidence(handle);
    }

    if (platform !== CodingPlatform.CODEFORCES) {
      return {
        supported: false,
        platform,
        reason:
          'Automated public-data assessment is not implemented for this platform. Human review is required; no score is inferred.',
      };
    }

    const [users, submissions, contests] = await Promise.all([
      this.getJson<CodeforcesUser[]>(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
      ),
      this.getJson<CodeforcesSubmission[]>(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`,
      ),
      this.getJson<CodeforcesContest[]>(
        `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`,
      ),
    ]);

    const user = users[0];
    if (!user) {
      throw new NotFoundException('Codeforces profile was not found');
    }

    const acceptedProblems = new Set(
      submissions
        .filter(
          (submission) =>
            submission.verdict === 'OK' && submission.problem?.index && submission.problem.name,
        )
        .map(
          (submission) =>
            `${submission.problem?.contestId ?? 'gym'}-${submission.problem?.index}-${submission.problem?.name}`,
        ),
    ).size;
    const score =
      this.acceptedProblemScore(acceptedProblems) +
      this.ratingScore(user.rating) +
      this.contestScore(contests.length);

    return {
      supported: true,
      platform,
      acceptedProblems,
      contests: contests.length,
      rating: user.rating ?? null,
      score,
    };
  }

  private async getLeetCodeEvidence(handle: string): Promise<CodingEvidence> {
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
    const matchedUser = body.data?.matchedUser;
    if (matchedUser === null) {
      throw new NotFoundException('LeetCode profile was not found');
    }

    const acceptedByDifficulty = matchedUser?.submitStats?.acSubmissionNum;
    const totalsByDifficulty = matchedUser?.submitStats?.totalSubmissionNum;
    if (!Array.isArray(acceptedByDifficulty) || !Array.isArray(totalsByDifficulty)) {
      throw new BadGatewayException('LeetCode returned incomplete submission statistics');
    }

    const difficulties: LeetCodeDifficulty[] = ['Easy', 'Medium', 'Hard'];
    const difficultyStats = {} as Record<LeetCodeDifficulty, LeetCodeDifficultyStats>;
    for (const difficulty of difficulties) {
      const accepted = acceptedByDifficulty.find((entry) => entry.difficulty === difficulty);
      const total = totalsByDifficulty.find((entry) => entry.difficulty === difficulty);
      const solved = accepted?.count;
      const acceptedSubmissions = accepted?.submissions;
      const totalSubmissions = total?.submissions;
      if (
        !Number.isInteger(solved) ||
        !Number.isInteger(acceptedSubmissions) ||
        !Number.isInteger(totalSubmissions) ||
        solved! < 0 ||
        acceptedSubmissions! < solved! ||
        totalSubmissions! < acceptedSubmissions!
      ) {
        throw new BadGatewayException(
          `LeetCode returned invalid ${difficulty.toLowerCase()} submission statistics`,
        );
      }

      difficultyStats[difficulty] = {
        solved: solved!,
        acceptedSubmissions: acceptedSubmissions!,
        totalSubmissions: totalSubmissions!,
        acceptanceRate:
          totalSubmissions === 0 ? null : (acceptedSubmissions! / totalSubmissions!) * 100,
      };
    }

    const attemptsForRate = difficulties
      .map((difficulty) => difficultyStats[difficulty])
      .filter((stats) => stats.totalSubmissions >= 10);
    const acceptedAttempts = attemptsForRate.reduce(
      (sum, stats) => sum + stats.acceptedSubmissions,
      0,
    );
    const totalAttempts = attemptsForRate.reduce((sum, stats) => sum + stats.totalSubmissions, 0);
    const weightedAcceptanceRate =
      totalAttempts === 0 ? null : (acceptedAttempts / totalAttempts) * 100;

    const scoreBreakdown = {
      easySolved: this.leetCodeEasyScore(difficultyStats.Easy.solved),
      mediumSolved: this.leetCodeMediumScore(difficultyStats.Medium.solved),
      hardSolved: this.leetCodeHardScore(difficultyStats.Hard.solved),
      acceptanceRateBonus: this.leetCodeAcceptanceBonus(weightedAcceptanceRate),
    };

    return {
      supported: true,
      platform: 'LEETCODE',
      difficultyStats,
      weightedAcceptanceRate,
      scoreBreakdown,
      score: Object.values(scoreBreakdown).reduce((sum, points) => sum + points, 0),
    };
  }

  private async getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': 'AlumniConnect-Candidate-Assessment', ...headers },
        signal: AbortSignal.timeout(10_000),
      });
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
