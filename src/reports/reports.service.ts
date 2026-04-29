import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async reportUser(
    reporterId: string,
    reportedId: string,
    reason: string,
    details?: string,
  ) {
    if (reporterId === reportedId) {
      throw new ForbiddenException('Cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: reportedId },
    });

    if (!reportedUser || !reportedUser.isActive) {
      throw new NotFoundException('User not found');
    }

    const existingReport = await this.prisma.report.findUnique({
      where: { reporterId_reportedId: { reporterId, reportedId } },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this user');
    }

    return this.prisma.report.create({
      data: { reporterId, reportedId, reason, details },
    });
  }

  async getAllReports(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, username: true, email: true } },
        reported: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReportStatus(
    reportId: string,
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
    adminId: string,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status, updatedAt: new Date() },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'UPDATE_REPORT_STATUS',
        targetId: reportId,
        targetType: 'REPORT',
        details: { status },
      },
    });

    return { success: true };
  }
}
