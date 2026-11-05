import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, CodingPlatform, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prototypeStore: InMemoryPrototypeStore,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnprocessableEntityException('Password must be at most 72 UTF-8 bytes');
    }

    const inMemory = process.env.PROTOTYPE_IN_MEMORY === 'true';
    let existingUser: any;
    if (inMemory) {
      existingUser = this.prototypeStore.findUserByEmail(email);
    } else {
      try {
        existingUser = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
      } catch {
        existingUser = this.prototypeStore.findUserByEmail(email);
      }
    }

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user: any;

    if (inMemory) {
      user = this.prototypeStore.createUser({
        email,
        passwordHash,
        role: dto.role,
        status: AccountStatus.ACTIVE,
        deletedAt: null,
      });

      // Construct and attach rich profile
      const profile = {
        id: randomUUID(),
        userId: user.id,
        firstName: dto.firstName?.trim() || (dto.role === 'ALUMNI' ? 'Alumni' : 'Student'),
        lastName: dto.lastName?.trim() || 'Member',
        department: dto.department || 'Computer Science & Engineering',
        graduationYear: dto.graduationYear ? Number(dto.graduationYear) : (dto.role === 'ALUMNI' ? 2021 : 2026),
        // Student
        githubUsername: dto.githubUsername?.trim(),
        codingPlatform: dto.codingPlatform || 'LeetCode',
        codingHandle: dto.codingHandle?.trim(),
        targetRoles: dto.targetRoles || ['Software Engineer', 'Full Stack Developer'],
        // Alumni
        company: dto.company?.trim() || (dto.role === 'ALUMNI' ? 'Tech Industry' : undefined),
        title: dto.title?.trim() || (dto.role === 'ALUMNI' ? 'Senior Software Engineer' : undefined),
        location: dto.location?.trim() || (dto.role === 'ALUMNI' ? 'San Francisco, CA' : undefined),
        skills: dto.skills && dto.skills.length > 0 ? dto.skills : ['TypeScript', 'Node.js', 'Distributed Systems'],
        willingToMentor: dto.willingToMentor ?? true,
        willingToRefer: dto.willingToRefer ?? (dto.role === 'ALUMNI'),
        bio: dto.bio?.trim() || (dto.role === 'ALUMNI' ? 'Experienced graduate willing to mentor motivated students.' : undefined),
        isTopTier: dto.role === 'ALUMNI' && ['google', 'stripe', 'meta', 'apple', 'amazon', 'netflix'].includes(dto.company?.toLowerCase() || ''),
      };

      user.profile = profile;

      // If student provided github handle, pre-link their validation profile
      if (dto.role === UserRole.STUDENT && dto.githubUsername) {
        this.prototypeStore.saveValidationProfile(user.id, {
          githubUsername: dto.githubUsername.trim(),
          codingPlatform: (dto.codingPlatform as CodingPlatform) || CodingPlatform.LEETCODE,
          codingHandle: dto.codingHandle?.trim() || dto.githubUsername.trim(),
        });
      }

      return this.issueAccessToken({ id: user.id, email: user.email, role: user.role, profile: user.profile });
    }

    try {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: dto.role,
          status: AccountStatus.ACTIVE,
          isEmailVerified: false,
        },
        select: { id: true, email: true, role: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists');
      }
      user = this.prototypeStore.createUser({
        email,
        passwordHash,
        role: dto.role,
        status: AccountStatus.ACTIVE,
        deletedAt: null,
      });
    }

    return this.issueAccessToken(user);
  }

  async login(dto: LoginDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const email = dto.email.trim().toLowerCase();
    let user: any =
      process.env.PROTOTYPE_IN_MEMORY === 'true'
        ? this.prototypeStore.findUserByEmail(email)
        : null;

    if (!user) {
      try {
        user = await this.prisma.user.findUnique({
          where: { email },
          include: { profile: true },
        });
      } catch {
        user = this.prototypeStore.findUserByEmail(email);
      }
    }

    if (!user) {
      user = this.prototypeStore.findUserByEmail(email);
    }

    if (
      !user ||
      user.status !== AccountStatus.ACTIVE ||
      user.deletedAt ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Role-specific check if user attempted logging in through a specific portal
    if (dto.role && user.role !== dto.role) {
      const portalType = dto.role === UserRole.ALUMNI ? 'Alumni' : 'Student';
      const actualType = user.role === UserRole.ALUMNI ? 'Alumni' : 'Student';
      throw new UnauthorizedException(
        `This account is registered as a ${actualType}. Please use the ${actualType} portal to sign in.`,
      );
    }

    return this.issueAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  }

  private async issueAccessToken(user: { id: string; email: string; role: UserRole; profile?: any }) {
    const expiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m');
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }
}
