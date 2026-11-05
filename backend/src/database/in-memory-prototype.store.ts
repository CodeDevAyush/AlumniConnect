import { Injectable, OnModuleInit } from '@nestjs/common';
import { CandidateAssessmentStatus, CodingPlatform, Prisma, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface PrototypeUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE';
  deletedAt: null;
  passwordHash: string;
}

export interface PrototypeValidationProfile {
  id: string;
  userId: string;
  githubUsername: string;
  topRepoUrl?: string;
  codingPlatform: CodingPlatform;
  codingHandle: string;
  consentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrototypeAssessment {
  id: string;
  userId: string;
  profileId: string;
  status: CandidateAssessmentStatus;
  score: number | null;
  githubScore: number;
  codingScore: number | null;
  evidenceQualityScore: number | null;
  ownershipVerified: false;
  evidence: Prisma.InputJsonObject;
  assessedAt: Date;
  topProjectEvaluation?: any;
  storedJsonFilename?: string;
  storedJsonPath?: string;
}

export interface PrototypeConnectionRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING';
  createdAt: Date;
}

export interface PrototypeCommunityPost {
  id: string;
  title: string;
  content: string;
  category: 'MENTOR_UPDATE' | 'TECH_INSIGHT' | 'REFERRAL' | 'EVENT';
  authorName: string;
  authorRole: string;
  authorCompany?: string;
  tags: string[];
  likesCount: number;
  publishedAt: string;
}

export const PROTOTYPE_ALUMNI_IDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
] as const;

@Injectable()
export class InMemoryPrototypeStore implements OnModuleInit {
  private readonly usersById = new Map<string, PrototypeUser>();
  private readonly userIdsByEmail = new Map<string, string>();
  private readonly profilesByUserId = new Map<string, PrototypeValidationProfile>();
  private readonly assessmentsByUserId = new Map<string, PrototypeAssessment[]>();
  private readonly connectionsByUserId = new Map<string, PrototypeConnectionRequest[]>();
  private readonly communityPosts: PrototypeCommunityPost[] = [
    {
      id: 'post-1',
      title: 'How we evaluate Distributed Systems & High-Throughput code at Google',
      content: 'When looking at junior and mid-level software engineering portfolios, clean architecture and automated test coverage matter exponentially more than raw commit counts. Make sure your repository has clear README documentation, modular service separation, and zero high-severity security vulnerabilities.',
      category: 'TECH_INSIGHT',
      authorName: 'Sarah Chen',
      authorRole: 'Senior Staff Software Engineer',
      authorCompany: 'Google',
      tags: ['Google', 'Distributed Systems', 'Code Quality', 'Clean Code'],
      likesCount: 38,
      publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'post-2',
      title: 'Stripe 2026 Payments Infrastructure: What we look for in candidate codebases',
      content: 'We are currently reviewing candidates for our infrastructure and backend teams. Candidates who have verified 80+ assessment scores on AlumniConnect demonstrating cognitive complexity control and SonarQube/Semgrep clean passes receive prioritized recruiter screens.',
      category: 'REFERRAL',
      authorName: 'Marcus Vance',
      authorRole: 'Lead Infrastructure Engineer',
      authorCompany: 'Stripe',
      tags: ['Stripe', 'Referrals', 'Hiring', 'FinTech'],
      likesCount: 54,
      publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'post-3',
      title: 'Hosting Weekly 1:1 Mentorship Hours: Tackling ML & Algorithm Interviews',
      content: 'Excited to open 4 mentorship slots this month! We will cover PyTorch deployment, FastAPI production architectures, and end-to-end coding assessments. Students with 80+ ratings can connect directly on the Discovery page.',
      category: 'MENTOR_UPDATE',
      authorName: 'Priya Sharma',
      authorRole: 'Machine Learning Engineer',
      authorCompany: 'Meta',
      tags: ['Meta', 'Mentorship', 'Machine Learning', 'AI'],
      likesCount: 42,
      publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  ];

  async onModuleInit() {
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('DemoPassword2026!', salt);
    const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', salt);

    if (!this.findUserByEmail('admin@alumniconnect.edu')) {
      this.createUser({
        email: 'admin@alumniconnect.edu',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        deletedAt: null,
      });
    }

    if (!this.findUserByEmail('alumni.sarah@google.com')) {
      this.createUser({
        email: 'alumni.sarah@google.com',
        passwordHash: demoPasswordHash,
        role: UserRole.ALUMNI,
        status: 'ACTIVE',
        deletedAt: null,
      });
    }

    if (!this.findUserByEmail('student.alex@university.edu')) {
      this.createUser({
        email: 'student.alex@university.edu',
        passwordHash: demoPasswordHash,
        role: UserRole.STUDENT,
        status: 'ACTIVE',
        deletedAt: null,
      });
    }
  }

  findUserByEmail(email: string): PrototypeUser | undefined {
    const userId = this.userIdsByEmail.get(email);
    return userId ? this.usersById.get(userId) : undefined;
  }

  findUserById(userId: string): PrototypeUser | undefined {
    return this.usersById.get(userId);
  }

  createUser(input: Omit<PrototypeUser, 'id'>): PrototypeUser {
    const user = { id: randomUUID(), ...input };
    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(user.email, user.id);
    return user;
  }

  getValidationProfile(userId: string): PrototypeValidationProfile | undefined {
    return this.profilesByUserId.get(userId);
  }

  getValidationProfileWithLatestAssessment(userId: string) {
    const profile = this.getValidationProfile(userId);
    if (!profile) return null;

    const assessments = this.assessmentsByUserId.get(userId) ?? [];
    const latest = assessments[assessments.length - 1];
    return { ...profile, assessments: latest ? [latest] : [] };
  }

  saveValidationProfile(
    userId: string,
    input: Pick<PrototypeValidationProfile, 'githubUsername' | 'codingPlatform' | 'codingHandle'> & {
      topRepoUrl?: string;
    },
  ): PrototypeValidationProfile {
    const current = this.profilesByUserId.get(userId);
    const now = new Date();
    const profile: PrototypeValidationProfile = current
      ? { ...current, ...input, consentAt: now, updatedAt: now }
      : {
          id: randomUUID(),
          userId,
          ...input,
          consentAt: now,
          createdAt: now,
          updatedAt: now,
        };
    this.profilesByUserId.set(userId, profile);
    return profile;
  }

  deleteValidationProfile(userId: string): boolean {
    this.assessmentsByUserId.delete(userId);
    return this.profilesByUserId.delete(userId);
  }

  addAssessment(assessment: Omit<PrototypeAssessment, 'id' | 'assessedAt'>): PrototypeAssessment {
    const saved = { id: randomUUID(), assessedAt: new Date(), ...assessment };
    const assessments = this.assessmentsByUserId.get(assessment.userId) ?? [];
    assessments.push(saved);
    this.assessmentsByUserId.set(assessment.userId, assessments);
    return saved;
  }

  getLatestAssessmentScore(userId: string): number | null {
    const assessments = this.assessmentsByUserId.get(userId) ?? [];
    return assessments[assessments.length - 1]?.score ?? null;
  }

  addConnectionRequest(requesterId: string, receiverId: string): PrototypeConnectionRequest {
    const requests = this.connectionsByUserId.get(requesterId) ?? [];
    const request: PrototypeConnectionRequest = {
      id: randomUUID(),
      requesterId,
      receiverId,
      status: 'PENDING',
      createdAt: new Date(),
    };
    requests.push(request);
    this.connectionsByUserId.set(requesterId, requests);
    return request;
  }

  getConnectionRequests(userId: string): PrototypeConnectionRequest[] {
    return [...(this.connectionsByUserId.get(userId) ?? [])];
  }

  getCommunityPosts(): PrototypeCommunityPost[] {
    return [...this.communityPosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  addCommunityPost(
    post: Omit<PrototypeCommunityPost, 'id' | 'publishedAt' | 'likesCount'>,
  ): PrototypeCommunityPost {
    const newPost: PrototypeCommunityPost = {
      id: randomUUID(),
      ...post,
      likesCount: 0,
      publishedAt: new Date().toISOString(),
    };
    this.communityPosts.unshift(newPost);
    return newPost;
  }

  likeCommunityPost(postId: string): boolean {
    const post = this.communityPosts.find((p) => p.id === postId);
    if (post) {
      post.likesCount += 1;
      return true;
    }
    return false;
  }
}
