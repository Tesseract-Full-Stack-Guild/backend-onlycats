import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../commons/guards/roles.guard.js';
import { Roles } from '../../commons/decorators/roles.decorator.js';
import { Role } from '../../commons/enums/roles.enum.js';
import type { Request } from 'express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.USER)
  @Get('dashboard')
  async getUserDashboard(@Req() req: Request) {
    console.log('Request cookies:', req.cookies);
    console.log('Request headers:', req.headers.authorization);
    return (await this.usersService.getUser(req)).message;
  }
}
