import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

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
    const existingUser = inMemory
      ? this.prototypeStore.findUserByEmail(email)
      : await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    let user: { id: string; email: string; role: UserRole };
    const passwordHash = await bcrypt.hash(dto.password, 12);
    if (inMemory) {
      user = this.prototypeStore.createUser({
        email,
        passwordHash,
        role: dto.role,
        status: AccountStatus.ACTIVE,
        deletedAt: null,
      });
      return this.issueAccessToken({ id: user.id, email: user.email, role: user.role });
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
      throw error;
    }

    return this.issueAccessToken(user);
  }

  async login(dto: LoginDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const email = dto.email.trim().toLowerCase();
    const user =
      process.env.PROTOTYPE_IN_MEMORY === 'true'
        ? this.prototypeStore.findUserByEmail(email)
        : await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.status !== AccountStatus.ACTIVE ||
      user.deletedAt ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueAccessToken({ id: user.id, email: user.email, role: user.role });
  }

  private async issueAccessToken(user: { id: string; email: string; role: UserRole }) {
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
