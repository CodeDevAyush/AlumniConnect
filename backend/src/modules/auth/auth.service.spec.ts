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

  beforeEach(() => {
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
          isEmailVerified: false,
        }),
      }),
    );
    const savedHash = prisma.user.create.mock.calls[0][0].data.passwordHash;
    expect(await bcrypt.compare('a-strong-password', savedHash)).toBe(true);
    expect(result.accessToken).toBe('signed-access-token');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid credentials with a generic error', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordHash: 'invalid-hash' });

    await expect(service.login({ email: user.email, password: 'wrong-password' })).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('registers and logs in using memory without calling Prisma', async () => {
    const previousMode = process.env.PROTOTYPE_IN_MEMORY;
    process.env.PROTOTYPE_IN_MEMORY = 'true';
    try {
      const registration = await service.register({
        email: 'memory@example.edu',
        password: 'a-strong-password',
        role: UserRole.STUDENT,
      });
      const login = await service.login({
        email: 'MEMORY@example.edu',
        password: 'a-strong-password',
      });

      expect(registration.accessToken).toBe('signed-access-token');
      expect(login.accessToken).toBe('signed-access-token');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    } finally {
      if (previousMode === undefined) delete process.env.PROTOTYPE_IN_MEMORY;
      else process.env.PROTOTYPE_IN_MEMORY = previousMode;
    }
  });
});
