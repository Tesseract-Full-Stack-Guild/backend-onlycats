import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { AuthGuard } from '@nestjs/passport';
import type { JwtPayload } from '../../types/express';
import type { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('blocks')
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  @Post(':userId')
  async blockUser(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Body('reason') reason?: string,
  ) {
    const currentUser = req.user as JwtPayload;
    return this.blocksService.blockUser(currentUser.userId, userId, reason);
  }

  @Delete(':userId')
  async unblockUser(@Req() req: Request, @Param('userId') userId: string) {
    const currentUser = req.user as JwtPayload;
    return this.blocksService.unblockUser(currentUser.userId, userId);
  }

  @Get()
  async getBlockedUsers(@Req() req: Request) {
    const currentUser = req.user as JwtPayload;
    return this.blocksService.getBlockedUsers(currentUser.userId);
  }
}

