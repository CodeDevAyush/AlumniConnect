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
}

@Injectable()
export class InMemoryPrototypeStore implements OnModuleInit {
  private readonly usersById = new Map<string, PrototypeUser>();
  private readonly userIdsByEmail = new Map<string, string>();
  private readonly profilesByUserId = new Map<string, PrototypeValidationProfile>();
  private readonly assessmentsByUserId = new Map<string, PrototypeAssessment[]>();

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
    input: Pick<PrototypeValidationProfile, 'githubUsername' | 'codingPlatform' | 'codingHandle'>,
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
}
