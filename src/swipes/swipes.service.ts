import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class SwipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blocksService: BlocksService,
  ) {}

  async swipe(
    swiperId: string,
    swipedId: string,
    action: 'LIKE' | 'PASS' = 'LIKE',
  ) {
    if (swiperId === swipedId) {
      throw new BadRequestException('Cannot swipe on yourself');
    }

    // Check if blocked
    const isBlocked = await this.blocksService.isBlocked(swiperId, swipedId);
    if (isBlocked) {
      throw new ForbiddenException('Cannot swipe: user is blocked');
    }

    const [swiper, swiped] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: swiperId } }),
      this.prisma.user.findUnique({ where: { id: swipedId } }),
    ]);

    if (!swiper || !swiped) {
      throw new NotFoundException('User not found');
    }

    const existingSwipe = await this.prisma.swipe.findUnique({
      where: { swiperId_swipedId: { swiperId, swipedId } },
    });

    if (existingSwipe) {
      const updated = await this.prisma.swipe.update({
        where: { id: existingSwipe.id },
        data: { action },
      });

      if (action === 'LIKE') {
        return await this.checkMutualMatch(swiperId, swipedId);
      }
      return { matched: false, previousSwipe: updated };
    }

    const swipe = await this.prisma.swipe.create({
      data: { swiperId, swipedId, action },
    });

    if (action === 'LIKE') {
      return await this.checkMutualMatch(swiperId, swipedId);
    }

    return { matched: false, previousSwipe: swipe };
  }

  private async checkMutualMatch(swiperId: string, swipedId: string) {
    const reverseSwipe = await this.prisma.swipe.findUnique({
      where: { swiperId_swipedId: { swiperId: swipedId, swipedId: swiperId } },
    });

    if (reverseSwipe && reverseSwipe.action === 'LIKE') {
      const match = await this.prisma.match.upsert({
        where: {
          initiatorId_targetId: { initiatorId: swiperId, targetId: swipedId },
        },
        update: {},
        create: { initiatorId: swiperId, targetId: swipedId },
      });
      return { matched: true, match };
    }
    return { matched: false };
  }

  async getMySwipes(userId: string) {
    const swipes = await this.prisma.swipe.findMany({
      where: { swiperId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        swiped: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                age: true,
                interests: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    return swipes.map((s) => ({
      id: s.id,
      action: s.action,
      createdAt: s.createdAt,
      user: {
        id: s.swiped.id,
        username: s.swiped.username,
        profile: {
          name: s.swiped.profile?.name || null,
          age: s.swiped.profile?.age || null,
          interests: s.swiped.profile?.interests || [],
          photoUrl: s.swiped.profile?.photos[0]?.url || null,
        },
      },
    }));
  }

  async getWhoLikedMe(userId: string) {
    const likes = await this.prisma.swipe.findMany({
      where: { swipedId: userId, action: 'LIKE' },
      orderBy: { createdAt: 'desc' },
      include: {
        swiper: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                age: true,
                interests: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    return likes.map((l) => ({
      id: l.id,
      user: {
        id: l.swiper.id,
        username: l.swiper.username,
        profile: {
          name: l.swiper.profile?.name || null,
          age: l.swiper.profile?.age || null,
          interests: l.swiper.profile?.interests || [],
          photoUrl: l.swiper.profile?.photos[0]?.url || null,
        },
      },
      createdAt: l.createdAt,
    }));
  }

  async getMatches(userId: string) {
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
                age: true,
                interests: true,
                photos: { where: { isPrimary: true }, take: 1 },
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
                age: true,
                interests: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return matches.map((m) => {
      const isInitiator = m.initiatorId === userId;
      const matchedUser = isInitiator ? m.target : m.initiator;
      const matchedUserProfile = matchedUser.profile;

      return {
        id: m.id,
        matchedAt: m.createdAt,
        lastMessage: m.messages[0]?.content || null,
        lastMessageAt: m.messages[0]?.createdAt || null,
        user: {
          id: matchedUser.id,
          username: matchedUser.username,
          profile: {
            name: matchedUserProfile?.name || null,
            age: matchedUserProfile?.age || null,
            interests: matchedUserProfile?.interests || [],
            photoUrl: matchedUserProfile?.photos[0]?.url || null,
          },
        },
      };
    });
  }

  async undoLastSwipe(userId: string) {
    const lastSwipe = await this.prisma.swipe.findFirst({
      where: { swiperId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastSwipe) {
      throw new NotFoundException('No swipe to undo');
    }

    const match = await this.prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId: userId, targetId: lastSwipe.swipedId },
          { initiatorId: lastSwipe.swipedId, targetId: userId },
        ],
      },
    });

    if (match) {
      throw new ForbiddenException('Cannot undo swipe after match formed');
    }

    await this.prisma.swipe.delete({ where: { id: lastSwipe.id } });
    return { success: true, message: 'Swipe undone' };
  }

  async unmatch(userId: string, matchedUserId: string) {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId: userId, targetId: matchedUserId },
          { initiatorId: matchedUserId, targetId: userId },
        ],
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.prisma.match.delete({ where: { id: match.id } });

    this.prisma.matchScore.deleteMany({
      where: {
        OR: [
          { userAId: userId, userBId: matchedUserId },
          { userAId: matchedUserId, userBId: userId },
        ],
      },
    });

    return { success: true, message: 'Unmatched successfully' };
  }
}

