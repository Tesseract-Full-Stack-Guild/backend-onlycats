import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

export interface Conversation {
  matchId: string;
  match: {
    id: string;
    createdAt: Date;
  };
  otherUser: {
    id: string;
    username: string;
    profile: {
      name: string;
      photos: { url: string; isPrimary: boolean }[];
    } | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
  };
  unreadCount: number;
}

export interface MessageWithSender {
  id: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  senderId: string;
  receiverId: string;
  sender: { id: string; username: string };
  receiver: { id: string; username: string };
}

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(userId: string, dto: CreateMessageDto) {
    const { matchId, receiverId, content } = dto;

    if (!matchId && !receiverId) {
      throw new BadRequestException(
        'Either matchId or receiverId must be provided',
      );
    }

    if (matchId && receiverId) {
      throw new BadRequestException(
        'Provide only matchId OR receiverId, not both',
      );
    }

    let actualMatchId = matchId;
    let actualReceiverId = receiverId;

    // If matchId provided, validate match and get receiver from match
    if (matchId) {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: { initiator: true, target: true },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.initiatorId !== userId && match.targetId !== userId) {
        throw new ForbiddenException('You are not part of this match');
      }

      actualReceiverId =
        match.initiatorId === userId ? match.targetId : match.initiatorId;
      actualMatchId = matchId;
    } else if (receiverId) {
      // Validate receiver exists
      const receiver = await this.prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new NotFoundException('Receiver user not found');
      }

      // Check if there is an existing match between these users
      const existingMatch = await this.prisma.match.findFirst({
        where: {
          OR: [
            { initiatorId: userId, targetId: receiverId },
            { initiatorId: receiverId, targetId: userId },
          ],
        },
      });

      if (existingMatch) {
        actualMatchId = existingMatch.id;
      } else {
        // No existing match, create message without match (matchId undefined)
        actualMatchId = undefined;
      }
    }

    if (!actualReceiverId) {
      throw new BadRequestException('Receiver not determined');
    }

    const message = await this.prisma.message.create({
      data: {
        matchId: actualMatchId,
        senderId: userId,
        receiverId: actualReceiverId,
        content,
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
        match: true,
      },
    });

    return message;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ initiatorId: userId }, { targetId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                photos: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                photos: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // last message
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    return matches
      .map((match) => {
        const otherUser =
          match.initiatorId === userId ? match.target : match.initiator;

        const lastMessage = match.messages[0];
        if (!lastMessage) return null;

        return {
          matchId: match.id,
          match: { id: match.id, createdAt: match.createdAt },
          otherUser,
          lastMessage,
          unreadCount: 0, // we’ll fix this below
        };
      })
      .filter(Boolean) as Conversation[];
  }

  async getMessagesByMatch(matchId: string, userId: string, cursor?: string) {
    // Verify user is part of the match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.initiatorId !== userId && match.targetId !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }

    const messages = await this.prisma.message.findMany({
      where: { matchId },
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    return messages as MessageWithSender[];
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark messages addressed to you as read',
      );
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });

    return { success: true };
  }

  async markAllAsReadInMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.initiatorId !== userId && match.targetId !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }

    await this.prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unreadCounts = await this.prisma.message.groupBy({
      by: ['matchId'],
      where: {
        receiverId: userId,
        readAt: null,
      },
      _count: true,
    });

    const total = unreadCounts.reduce((sum, u) => sum + u._count, 0);
    return total;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender or receiver can delete
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You cannot delete this message');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return { success: true, message: 'Message deleted' };
  }
}
