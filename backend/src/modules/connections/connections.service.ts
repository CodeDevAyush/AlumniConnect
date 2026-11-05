import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, ConnectionStatus, UserRole } from '@prisma/client';
import {
  InMemoryPrototypeStore,
  PROTOTYPE_ALUMNI_IDS,
} from '../../database/in-memory-prototype.store';
import { PrismaService } from '../../database/prisma.service';

const MINIMUM_CONNECTION_SCORE = 80;

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prototypeStore: InMemoryPrototypeStore,
  ) {}

  async getUserConnections(userId: string) {
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return this.prototypeStore.getConnectionRequests(userId);
    }

    return this.prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });
  }

  async getEligibility(userId: string) {
    const score = await this.getLatestAssessmentScore(userId);
    return {
      eligible: score !== null && score > MINIMUM_CONNECTION_SCORE,
      latestScore: score,
      requiredScore: MINIMUM_CONNECTION_SCORE,
      requirement: 'score must be greater than 80',
    };
  }

  async requestConnection(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) {
      throw new BadRequestException('You cannot request a connection with yourself');
    }

    const eligibility = await this.getEligibility(requesterId);
    if (!eligibility.eligible) {
      throw new ForbiddenException(
        'An assessment score greater than 80 is required before requesting alumni connections',
      );
    }

    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      if (!PROTOTYPE_ALUMNI_IDS.includes(receiverId as (typeof PROTOTYPE_ALUMNI_IDS)[number])) {
        throw new NotFoundException('Prototype alumni profile was not found');
      }
      if (
        this.prototypeStore
          .getConnectionRequests(requesterId)
          .some((request) => request.receiverId === receiverId)
      ) {
        throw new ConflictException('A connection request already exists for this alumni');
      }
      return this.prototypeStore.addConnectionRequest(requesterId, receiverId);
    }

    const alumni = await this.prisma.user.findFirst({
      where: {
        id: receiverId,
        role: UserRole.ALUMNI,
        status: AccountStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!alumni) {
      throw new NotFoundException('Active alumni profile was not found');
    }

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A connection request or connection already exists');
    }

    return this.prisma.connection.create({
      data: { requesterId, receiverId, status: ConnectionStatus.PENDING },
    });
  }

  private async getLatestAssessmentScore(userId: string): Promise<number | null> {
    if (process.env.PROTOTYPE_IN_MEMORY === 'true') {
      return this.prototypeStore.getLatestAssessmentScore(userId);
    }

    const assessment = await this.prisma.candidateAssessment.findFirst({
      where: { userId },
      orderBy: { assessedAt: 'desc' },
      select: { score: true },
    });
    return assessment?.score ?? null;
  }
}
