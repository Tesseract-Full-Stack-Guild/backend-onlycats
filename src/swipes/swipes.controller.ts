import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { JwtPayload } from '../../types/express';

@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':swipedId/:action')
  async swipe(
    @Req() req: Request,
    @Param('swipedId') swipedId: string,
    @Param('action') action: 'LIKE' | 'PASS',
  ) {
    const user = req.user as JwtPayload;
    return this.swipesService.swipe(user.userId, swipedId, action);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-swipes')
  async getMySwipes(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.swipesService.getMySwipes(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('liked-me')
  async getWhoLikedMe(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.swipesService.getWhoLikedMe(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('matches')
  async getMatches(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.swipesService.getMatches(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('undo')
  async undoLastSwipe(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.swipesService.undoLastSwipe(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('unmatch/:matchedUserId')
  async unmatch(
    @Req() req: Request,
    @Param('matchedUserId') matchedUserId: string,
  ) {
    const user = req.user as JwtPayload;
    return this.swipesService.unmatch(user.userId, matchedUserId);
  }
}

