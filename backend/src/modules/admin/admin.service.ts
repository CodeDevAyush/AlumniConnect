import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalAlumni, totalStudents, pendingVerifications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ALUMNI' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalAlumni,
      totalStudents,
      pendingVerifications,
    };
  }
}
