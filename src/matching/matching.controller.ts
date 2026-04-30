import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';
import type { Request } from 'express';
import type { JwtPayload } from '../../types/express';
import { AuthGuard } from '@nestjs/passport';

@Controller('matches')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMatches(@Req() req: Request, @Query('limit') limit?: string) {
    const user = req.user as JwtPayload;
    const maxLimit = Math.min(parseInt(limit || '20', 10), 50);
    return this.matchingService.getCachedMatches(user.userId, maxLimit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('refresh')
  async refreshMatches(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.matchingService.getMatches(user.userId, 20);
  }
}

