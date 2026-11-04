import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserConnections(userId: string) {
    return this.prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });
  }
}
