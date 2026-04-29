import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../common/enums/roles.enum.js';
import type { JwtPayload } from '../../types/express.js';
import type { Request } from 'express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users/:id/activate')
  async toggleUserActivation(@Param('id') userId: string, @Req() req: Request) {
    const adminId = (req.user as JwtPayload).userId;
    return this.adminService.toggleUserActivation(userId, adminId);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Post('reports/:id/resolve')
  async resolveReport(@Param('id') reportId: string, @Req() req: Request) {
    const adminId = (req.user as JwtPayload).userId;
    return this.adminService.resolveReport(reportId, adminId);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
