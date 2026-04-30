import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: { select: { name: true, age: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleUserActivation(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newState = !user.isActive;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: newState },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        action: newState ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        targetId: userId,
        targetType: 'USER',
      },
    });

    return { success: true, isActive: newState };
  }

  async getReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { id: true, username: true } },
        reported: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string, adminId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new Error('Report not found');

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED', updatedAt: new Date() },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'RESOLVE_REPORT',
        targetId: reportId,
        targetType: 'REPORT',
      },
    });

    return { success: true };
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      totalMatches,
      totalMessages,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.match.count(),
      this.prisma.message.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalMatches,
      totalMessages,
      totalReports,
      pendingReports,
    };
  }
}

