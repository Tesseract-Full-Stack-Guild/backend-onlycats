import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '@nestjs/passport';
import type { JwtPayload } from '../../types/express.js';
import type { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  async getUserDashboard(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return { message: `Welcome User: ${user.username}` };
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(@Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.usersService.deactivateAccount(user.userId);
    return { success: true, message: 'Account deactivated' };
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.usersService.deleteAccount(user.userId);
    return { success: true, message: 'Account deleted' };
  }

  @Get('search')
  async searchUsers(@Req() req: Request, @Body('query') query: string) {
    const user = req.user as JwtPayload;
    return this.usersService.searchUsers(query, user.userId);
  }
}
