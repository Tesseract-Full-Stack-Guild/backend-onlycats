import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async blockUser(blockerId: string, blockedUserId: string, reason?: string) {
    if (blockerId === blockedUserId) {
      throw new ForbiddenException('Cannot block yourself');
    }

    const existing = await this.prisma.blockedUser.findUnique({
      where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
    });

    if (existing) {
      throw new ForbiddenException('User already blocked');
    }

    const block = await this.prisma.blockedUser.create({
      data: { blockerId, blockedUserId, reason },
    });

    // Delete any existing matches between these users
    await this.prisma.match.deleteMany({
      where: {
        OR: [
          { initiatorId: blockerId, targetId: blockedUserId },
          { initiatorId: blockedUserId, targetId: blockerId },
        ],
      },
    });

    // Delete all messages between them
    await this.prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: blockerId, receiverId: blockedUserId },
          { senderId: blockedUserId, receiverId: blockerId },
        ],
      },
    });

    return block;
  }

  async unblockUser(blockerId: string, blockedUserId: string) {
    const deleted = await this.prisma.blockedUser.delete({
      where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
    });

    if (!deleted) {
      throw new NotFoundException('Block not found');
    }

    return { success: true };
  }

  async getBlockedUsers(userId: string) {
    return this.prisma.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blockedUser: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const block = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedUserId: {
          blockerId: userId,
          blockedUserId: targetUserId,
        },
      },
    });
    return !!block;
  }
}

