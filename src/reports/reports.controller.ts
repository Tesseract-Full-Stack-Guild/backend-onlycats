import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../common/enums/roles.enum.js';
import type { JwtPayload } from '../../types/express.js';
import type { Request } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post(':userId')
  @UseGuards(AuthGuard('jwt'))
  async reportUser(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Body() body: { reason: string; details?: string },
  ) {
    const currentUser = req.user as JwtPayload;
    return this.reportsService.reportUser(
      currentUser.userId,
      userId,
      body.reason,
      body.details,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getAllReports(@Req() query: { status?: string }) {
    return this.reportsService.getAllReports(query.status);
  }

  @Patch(':reportId/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body('status') status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
    @Req() req: Request,
  ) {
    const adminId = (req.user as JwtPayload).userId;
    return this.reportsService.updateReportStatus(reportId, status, adminId);
  }
}
