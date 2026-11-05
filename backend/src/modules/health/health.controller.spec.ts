import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaService;
  const originalMode = process.env.PROTOTYPE_IN_MEMORY;

  beforeEach(async () => {
    delete process.env.PROTOTYPE_IN_MEMORY;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    if (originalMode === undefined) delete process.env.PROTOTYPE_IN_MEMORY;
    else process.env.PROTOTYPE_IN_MEMORY = originalMode;
  });

  it('should return status ok and db up when database responds', async () => {
    const res = await controller.check();
    expect(res.status).toBe('ok');
    expect(res.database).toBe('up');
    expect(res.service).toBe('alumniconnect-backend');
  });

  it('should return database disconnected if query fails without crashing', async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Connection refused'));
    const res = await controller.check();
    expect(res.status).toBe('ok');
    expect(res.database).toBe('disconnected');
  });
});
