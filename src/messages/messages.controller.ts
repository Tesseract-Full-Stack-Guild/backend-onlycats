import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import type { Request } from 'express';
import type { JwtPayload } from '../../types/express';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getConversations(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.messagesService.getConversations(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('match/:matchId')
  async getMessagesByMatch(
    @Param('matchId') matchId: string,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.messagesService.getMessagesByMatch(matchId, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.messagesService.sendMessage(user.userId, createMessageDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':messageId/read')
  async markAsRead(@Param('messageId') messageId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.messagesService.markAsRead(messageId, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('match/:matchId/read')
  async markAllAsReadInMatch(
    @Param('matchId') matchId: string,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.messagesService.markAllAsReadInMatch(matchId, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('unread/count')
  async getUnreadCount(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const count = await this.messagesService.getUnreadCount(user.userId);
    return { count };
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.messagesService.deleteMessage(messageId, user.userId);
  }
}

