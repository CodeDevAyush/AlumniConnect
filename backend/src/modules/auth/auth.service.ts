import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateToken(token: string) {
    if (!token) throw new UnauthorizedException('Token required');
    return { valid: true };
  }
}
