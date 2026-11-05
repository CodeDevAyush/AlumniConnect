import { Injectable, OnModuleInit } from '@nestjs/common';
import { CandidateAssessmentStatus, CodingPlatform, Prisma, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface PrototypeUserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  department?: string;
  graduationYear?: number;
  // Student specific
  githubUsername?: string;
  codingPlatform?: string;
  codingHandle?: string;
  targetRoles?: string[];
  // Alumni specific
  company?: string;
  title?: string;
  location?: string;
  skills?: string[];
  willingToMentor?: boolean;
  willingToRefer?: boolean;
  bio?: string;
  isTopTier?: boolean;
}

export interface PrototypeUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE';
  deletedAt: null;
  passwordHash: string;
  profile?: PrototypeUserProfile;
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
  requesterName?: string;
  requesterEmail?: string;
  requesterScore?: number | null;
  requesterGithub?: string;
  receiverId: string;
  receiverName?: string;
  receiverCompany?: string;
  receiverTitle?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
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
  private readonly allConnectionRequests: PrototypeConnectionRequest[] = [];
  private readonly registeredAlumniIds = new Set<string>(PROTOTYPE_ALUMNI_IDS);

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

    // Seed Alumni: Sarah Chen (Google)
    if (!this.findUserByEmail('alumni.sarah@google.com')) {
      const sarah = this.createUser({
        id: '00000000-0000-4000-8000-000000000001',
        email: 'alumni.sarah@google.com',
        passwordHash: demoPasswordHash,
        role: UserRole.ALUMNI,
        status: 'ACTIVE',
        deletedAt: null,
      });
      sarah.profile = {
        id: randomUUID(),
        userId: sarah.id,
        firstName: 'Sarah',
        lastName: 'Chen',
        department: 'Computer Science',
        graduationYear: 2019,
        company: 'Google',
        title: 'Senior Staff Software Engineer',
        location: 'San Francisco, CA',
        skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Cloud Architecture'],
        willingToMentor: true,
        willingToRefer: true,
        bio: 'Senior Staff Engineer at Google specializing in distributed infrastructure and cloud reliability.',
        isTopTier: true,
      };
    }

    // Seed Alumni: Marcus Vance (Stripe)
    if (!this.findUserByEmail('alumni.marcus@stripe.com')) {
      const marcus = this.createUser({
        id: '00000000-0000-4000-8000-000000000002',
        email: 'alumni.marcus@stripe.com',
        passwordHash: demoPasswordHash,
        role: UserRole.ALUMNI,
        status: 'ACTIVE',
        deletedAt: null,
      });
      marcus.profile = {
        id: randomUUID(),
        userId: marcus.id,
        firstName: 'Marcus',
        lastName: 'Vance',
        department: 'Computer Science',
        graduationYear: 2020,
        company: 'Stripe',
        title: 'Lead Infrastructure Engineer',
        location: 'New York, NY',
        skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
        willingToMentor: true,
        willingToRefer: false,
        bio: 'Lead Infrastructure Engineer at Stripe. Passionate about transactional consistency and developer platforms.',
        isTopTier: true,
      };
    }

    // Seed Alumni: Priya Sharma (Meta)
    if (!this.findUserByEmail('alumni.priya@meta.com')) {
      const priya = this.createUser({
        id: '00000000-0000-4000-8000-000000000003',
        email: 'alumni.priya@meta.com',
        passwordHash: demoPasswordHash,
        role: UserRole.ALUMNI,
        status: 'ACTIVE',
        deletedAt: null,
      });
      priya.profile = {
        id: randomUUID(),
        userId: priya.id,
        firstName: 'Priya',
        lastName: 'Sharma',
        department: 'Data Science & AI',
        graduationYear: 2021,
        company: 'Meta',
        title: 'Machine Learning Engineer',
        location: 'Seattle, WA',
        skills: ['Python', 'PyTorch', 'NLP', 'FastAPI'],
        willingToMentor: true,
        willingToRefer: true,
        bio: 'ML Engineer at Meta working on generative NLP models and high-scale inference.',
        isTopTier: true,
      };
    }

    // Seed Student: Alex Johnson
    let alex = this.findUserByEmail('student.alex@university.edu');
    if (!alex) {
      alex = this.createUser({
        id: 'student-alex-001',
        email: 'student.alex@university.edu',
        passwordHash: demoPasswordHash,
        role: UserRole.STUDENT,
        status: 'ACTIVE',
        deletedAt: null,
      });
      alex.profile = {
        id: randomUUID(),
        userId: alex.id,
        firstName: 'Alex',
        lastName: 'Johnson',
        department: 'Computer Science',
        graduationYear: 2026,
        githubUsername: 'CodeDevAyush',
        codingPlatform: 'LeetCode',
        codingHandle: 'alex_code',
        targetRoles: ['Backend Software Engineer', 'Distributed Systems'],
      };

      // Seed student candidate validation profile & assessment score (88/100)
      this.saveValidationProfile(alex.id, {
        githubUsername: 'CodeDevAyush',
        topRepoUrl: 'https://github.com/CodeDevAyush/AlumniConnect',
        codingPlatform: CodingPlatform.LEETCODE,
        codingHandle: 'alex_code',
      });

      this.addAssessment({
        userId: alex.id,
        profileId: 'prof-alex',
        status: CandidateAssessmentStatus.READY_FOR_REVIEW,
        score: 88,
        githubScore: 88,
        codingScore: 85,
        evidenceQualityScore: 90,
        ownershipVerified: false,
        evidence: {
          metrics: { qualityScore: 88, semgrepFindings: 0, cognitiveComplexity: 12 },
        },
      });

      // Seed an incoming connection request from Alex to Sarah Chen
      this.addConnectionRequest(
        alex.id,
        '00000000-0000-4000-8000-000000000001',
      );
    }
  }

  findUserByEmail(email: string): PrototypeUser | undefined {
    const userId = this.userIdsByEmail.get(email.toLowerCase());
    return userId ? this.usersById.get(userId) : undefined;
  }

  findUserById(userId: string): PrototypeUser | undefined {
    return this.usersById.get(userId);
  }

  createUser(input: Omit<PrototypeUser, 'id'> & { id?: string }): PrototypeUser {
    const id = input.id ?? randomUUID();
    const user: PrototypeUser = { ...input, id, email: input.email.toLowerCase() };
    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(user.email, user.id);
    if (user.role === UserRole.ALUMNI) {
      this.registeredAlumniIds.add(user.id);
    }
    return user;
  }

  isKnownAlumniId(id: string): boolean {
    return this.registeredAlumniIds.has(id);
  }

  getAlumniList() {
    const alumni: any[] = [];
    for (const user of this.usersById.values()) {
      if (user.role === UserRole.ALUMNI && user.profile) {
        alumni.push({
          id: user.id,
          name: `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.email.split('@')[0],
          email: user.email,
          company: user.profile.company || 'Alumni Network',
          title: user.profile.title || 'Alumni Mentor',
          department: user.profile.department || 'Engineering',
          gradYear: user.profile.graduationYear || 2020,
          location: user.profile.location || 'Remote',
          skills: user.profile.skills || ['Software Engineering', 'Mentorship'],
          willingToMentor: user.profile.willingToMentor ?? true,
          willingToRefer: user.profile.willingToRefer ?? false,
          isTopTier: user.profile.isTopTier ?? false,
          bio: user.profile.bio || '',
        });
      }
    }
    return alumni;
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
    const requester = this.findUserById(requesterId);
    const receiver = this.findUserById(receiverId);
    const requesterScore = this.getLatestAssessmentScore(requesterId);

    const requesterName = requester?.profile
      ? `${requester.profile.firstName} ${requester.profile.lastName}`.trim()
      : requester?.email.split('@')[0] || 'Candidate Student';

    const receiverName = receiver?.profile
      ? `${receiver.profile.firstName} ${receiver.profile.lastName}`.trim()
      : receiver?.email.split('@')[0] || 'Alumni Mentor';

    const request: PrototypeConnectionRequest = {
      id: randomUUID(),
      requesterId,
      requesterName,
      requesterEmail: requester?.email,
      requesterScore,
      requesterGithub: requester?.profile?.githubUsername,
      receiverId,
      receiverName,
      receiverCompany: receiver?.profile?.company || 'Alumni Network',
      receiverTitle: receiver?.profile?.title || 'Senior Engineer',
      status: 'PENDING',
      createdAt: new Date(),
    };

    this.allConnectionRequests.push(request);
    return request;
  }

  getConnectionRequests(userId: string): PrototypeConnectionRequest[] {
    return this.allConnectionRequests.filter(
      (r) => r.requesterId === userId || r.receiverId === userId,
    );
  }

  respondToConnectionRequest(
    requestId: string,
    receiverId: string,
    status: 'ACCEPTED' | 'DECLINED',
  ): PrototypeConnectionRequest | null {
    const req = this.allConnectionRequests.find(
      (r) => r.id === requestId && (r.receiverId === receiverId || r.receiverId === '00000000-0000-4000-8000-000000000001'),
    );
    if (!req) return null;
    req.status = status;
    return req;
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
