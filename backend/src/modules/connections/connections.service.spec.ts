import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InMemoryPrototypeStore } from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';
import { ConnectionsService } from './connections.service';

const alumniId = '00000000-0000-4000-8000-000000000001';

describe('ConnectionsService', () => {
  let service: ConnectionsService;
  let prototypeStore: {
    getLatestAssessmentScore: jest.Mock;
    getConnectionRequests: jest.Mock;
    addConnectionRequest: jest.Mock;
  };
  let prisma: {
    candidateAssessment: { findFirst: jest.Mock };
    user: { findFirst: jest.Mock };
    connection: { findFirst: jest.Mock; create: jest.Mock; findMany: jest.Mock };
  };
  const originalMode = process.env.PROTOTYPE_IN_MEMORY;

  beforeEach(() => {
    process.env.PROTOTYPE_IN_MEMORY = 'true';
    prototypeStore = {
      getLatestAssessmentScore: jest.fn().mockReturnValue(80),
      getConnectionRequests: jest.fn().mockReturnValue([]),
      addConnectionRequest: jest.fn((requesterId, receiverId) => ({
        id: 'request-1',
        requesterId,
        receiverId,
        status: 'PENDING',
      })),
    };
    prisma = {
      candidateAssessment: { findFirst: jest.fn() },
      user: { findFirst: jest.fn() },
      connection: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new ConnectionsService(
      prisma as unknown as PrismaService,
      prototypeStore as unknown as InMemoryPrototypeStore,
    );
  });

  afterEach(() => {
    if (originalMode === undefined) delete process.env.PROTOTYPE_IN_MEMORY;
    else process.env.PROTOTYPE_IN_MEMORY = originalMode;
  });

  it('requires a score strictly greater than 80', async () => {
    expect(await service.getEligibility('student-1')).toEqual({
      eligible: false,
      latestScore: 80,
      requiredScore: 80,
      requirement: 'score must be greater than 80',
    });

    await expect(service.requestConnection('student-1', alumniId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prototypeStore.addConnectionRequest).not.toHaveBeenCalled();
  });

  it('allows an eligible signed-in user to request a prototype alumni connection', async () => {
    prototypeStore.getLatestAssessmentScore.mockReturnValue(81);

    const request = await service.requestConnection('student-1', alumniId);

    expect(request).toMatchObject({
      requesterId: 'student-1',
      receiverId: alumniId,
      status: 'PENDING',
    });
    expect(prototypeStore.addConnectionRequest).toHaveBeenCalledWith('student-1', alumniId);
  });

  it('rejects repeated requests and unknown prototype alumni', async () => {
    prototypeStore.getLatestAssessmentScore.mockReturnValue(100);
    prototypeStore.getConnectionRequests.mockReturnValue([{ receiverId: alumniId }]);
    await expect(service.requestConnection('student-1', alumniId)).rejects.toBeInstanceOf(
      ConflictException,
    );

    prototypeStore.getConnectionRequests.mockReturnValue([]);
    await expect(
      service.requestConnection('student-1', '00000000-0000-4000-8000-000000000099'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
