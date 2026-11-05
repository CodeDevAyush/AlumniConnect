import { AccountStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user = {
    id: 'user-1',
    email: 'student@example.edu',
    role: UserRole.STUDENT,
    status: AccountStatus.ACTIVE,
    deletedAt: null,
    passwordHash: '',
  };
  let service: AuthService;
  let prototypeStore: InMemoryPrototypeStore;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { signAsync: jest.Mock };
  const originalMode = process.env.PROTOTYPE_IN_MEMORY;

  beforeEach(() => {
    delete process.env.PROTOTYPE_IN_MEMORY;
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 'user-1', email: data.email, role: data.role }),
          ),
      },
    };
    prototypeStore = new InMemoryPrototypeStore();
    jwt = { signAsync: jest.fn().mockResolvedValue('signed-access-token') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      prototypeStore,
      jwt as unknown as JwtService,
      { get: jest.fn().mockReturnValue('15m') } as unknown as ConfigService,
    );
  });

  afterEach(() => {
    if (originalMode === undefined) delete process.env.PROTOTYPE_IN_MEMORY;
    else process.env.PROTOTYPE_IN_MEMORY = originalMode;
  });

  it('registers with a password hash and returns a JWT without the hash', async () => {
    const result = await service.register({
      email: ' Student@Example.edu ',
      password: 'a-strong-password',
      role: UserRole.STUDENT,
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'student@example.edu',
          status: AccountStatus.ACTIVE,
        }),
      }),
    );
    expect(result).toMatchObject({
      accessToken: 'signed-access-token',
      user: {
        id: 'user-1',
        email: 'student@example.edu',
        role: UserRole.STUDENT,
      },
    });
  });

  it('verifies password against stored hash on login', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('secret-password', salt);
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordHash });

    const result = await service.login({
      email: 'student@example.edu',
      password: 'secret-password',
    });

    expect(result.accessToken).toBe('signed-access-token');
    expect(result.user.email).toBe('student@example.edu');
  });
});
