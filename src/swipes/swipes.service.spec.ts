import { Test, TestingModule } from '@nestjs/testing';
import { SwipesService } from './swipes.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlocksService } from '../blocks/blocks.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('SwipesService', () => {
  let service: SwipesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    swipe: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    match: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwipesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BlocksService,
          useValue: {
            isBlocked: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<SwipesService>(SwipesService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('swipe', () => {
    const swiperId = 'user-1';
    const swipedId = 'user-2';

    it('should throw BadRequestException when swiping on self', async () => {
      await expect(service.swipe(swiperId, swiperId, 'LIKE')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when swiped user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.swipe(swiperId, swipedId, 'LIKE')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a new LIKE swipe and return no match when no reverse swipe', async () => {
      const mockSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'LIKE' as const,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null); // No existing swipe
      mockPrismaService.swipe.create.mockResolvedValueOnce(mockSwipe);
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null); // Check for reverse swipe

      const result = await service.swipe(swiperId, swipedId, 'LIKE');

      expect(result).toEqual({ matched: false });
      expect(mockPrismaService.swipe.create).toHaveBeenCalledWith({
        data: { swiperId, swipedId, action: 'LIKE' },
      });
    });

    it('should throw NotFoundException when swiped user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.swipe(swiperId, swipedId, 'LIKE')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a new LIKE swipe and return no match when no reverse swipe', async () => {
      const mockSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'LIKE' as const,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.swipe.create.mockResolvedValueOnce(mockSwipe);
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null); // Check for reverse swipe

      const result = await service.swipe(swiperId, swipedId, 'LIKE');

      expect(result).toEqual({ matched: false });
      expect(mockPrismaService.swipe.create).toHaveBeenCalledWith({
        data: { swiperId, swipedId, action: 'LIKE' },
      });
    });

    it('should create a new LIKE swipe and return match when reverse swipe exists', async () => {
      const mockSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'LIKE' as const,
        createdAt: new Date(),
      };
      const mockMatch = {
        id: 'm1',
        initiatorId: swiperId,
        targetId: swipedId,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.swipe.create.mockResolvedValueOnce(mockSwipe);
      // Reverse swipe check
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce({
        id: 's2',
        swiperId: swipedId,
        swipedId: swiperId,
        action: 'LIKE',
      });
      mockPrismaService.match.upsert.mockResolvedValueOnce(mockMatch);

      const result = await service.swipe(swiperId, swipedId, 'LIKE');

      expect(result).toEqual({ matched: true, match: mockMatch });
      expect(mockPrismaService.match.upsert).toHaveBeenCalledWith({
        where: {
          initiatorId_targetId: { initiatorId: swiperId, targetId: swipedId },
        },
        update: {},
        create: { initiatorId: swiperId, targetId: swipedId },
      });
    });

    it('should create a new PASS swipe and return no match', async () => {
      const mockSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'PASS' as const,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.swipe.create.mockResolvedValueOnce(mockSwipe);

      const result = await service.swipe(swiperId, swipedId, 'PASS');

      expect(result).toEqual({ matched: false, previousSwipe: mockSwipe });
    });

    it('should update existing swipe from PASS to LIKE and return match', async () => {
      const existingSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'PASS' as const,
      };
      const updatedSwipe = { ...existingSwipe, action: 'LIKE' as const };
      const mockMatch = { id: 'm1', initiatorId: swiperId, targetId: swipedId };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(existingSwipe);
      mockPrismaService.swipe.update.mockResolvedValueOnce(updatedSwipe);
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce({
        id: 's2',
        swiperId: swipedId,
        swipedId: swiperId,
        action: 'LIKE',
      });
      mockPrismaService.match.upsert.mockResolvedValueOnce(mockMatch);

      const result = await service.swipe(swiperId, swipedId, 'LIKE');

      expect(result).toEqual({ matched: true, match: mockMatch });
      expect(mockPrismaService.swipe.update).toHaveBeenCalledWith({
        where: { id: existingSwipe.id },
        data: { action: 'LIKE' },
      });
    });

    it('should update existing swipe to PASS and return no match', async () => {
      const existingSwipe = {
        id: 's1',
        swiperId,
        swipedId,
        action: 'LIKE' as const,
      };
      const updatedSwipe = { ...existingSwipe, action: 'PASS' as const };
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swiperId,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: swipedId,
      });
      mockPrismaService.swipe.findUnique.mockResolvedValueOnce(existingSwipe);
      mockPrismaService.swipe.update.mockResolvedValueOnce(updatedSwipe);

      const result = await service.swipe(swiperId, swipedId, 'PASS');

      expect(result).toEqual({ matched: false, previousSwipe: updatedSwipe });
    });
  });

  describe('getMySwipes', () => {
    it('should return list of swipes with user profile data', async () => {
      const userId = 'user-1';
      const mockSwipes = [
        {
          id: 's1',
          createdAt: new Date(),
          swiped: {
            id: 'u2',
            username: 'jane',
            profile: {
              name: 'Jane',
              age: 25,
              interests: ['music', 'art'],
              photos: [{ url: 'photo1.jpg' }],
            },
          },
        },
      ];
      mockPrismaService.swipe.findMany.mockResolvedValueOnce(mockSwipes);

      const result = await service.getMySwipes(userId);

      expect(result).toEqual([
        {
          id: 's1',
          action: undefined,
          createdAt: mockSwipes[0].createdAt,
          user: {
            id: 'u2',
            username: 'jane',
            profile: {
              name: 'Jane',
              age: 25,
              interests: ['music', 'art'],
              photoUrl: 'photo1.jpg',
            },
          },
        },
      ]);
    });

    it('should handle user without profile', async () => {
      const userId = 'user-1';
      const mockSwipes = [
        {
          id: 's1',
          createdAt: new Date(),
          swiped: {
            id: 'u2',
            username: 'jane',
            profile: null,
          },
        },
      ];
      mockPrismaService.swipe.findMany.mockResolvedValueOnce(mockSwipes);

      const result = await service.getMySwipes(userId);

      expect(result[0].user.profile).toEqual({
        name: null,
        age: null,
        interests: [],
        photoUrl: null,
      });
    });
  });

  describe('getWhoLikedMe', () => {
    it('should return users who liked the current user', async () => {
      const userId = 'user-1';
      const mockLikes = [
        {
          id: 's1',
          createdAt: new Date(),
          swiper: {
            id: 'u2',
            username: 'john',
            profile: {
              name: 'John',
              age: 28,
              interests: ['sports'],
              photos: [{ url: 'photo2.jpg' }],
            },
          },
        },
      ];
      mockPrismaService.swipe.findMany.mockResolvedValueOnce(mockLikes);

      const result = await service.getWhoLikedMe(userId);

      expect(result).toEqual([
        {
          id: 's1',
          user: {
            id: 'u2',
            username: 'john',
            profile: {
              name: 'John',
              age: 28,
              interests: ['sports'],
              photoUrl: 'photo2.jpg',
            },
          },
          createdAt: mockLikes[0].createdAt,
        },
      ]);
    });
  });

  describe('getMatches', () => {
    it('should return matches with matched user data', async () => {
      const userId = 'user-1';
      const mockMatches = [
        {
          id: 'm1',
          initiatorId: userId,
          targetId: 'u2',
          createdAt: new Date(),
          initiator: { id: userId, username: 'user1' },
          target: {
            id: 'u2',
            username: 'jane',
            profile: {
              name: 'Jane',
              age: 25,
              interests: [],
              photos: [{ url: 'photo.jpg' }],
            },
          },
          messages: [{ content: 'Hi!', createdAt: new Date() }],
        },
      ];
      mockPrismaService.match.findMany.mockResolvedValueOnce(mockMatches);

      const result = await service.getMatches(userId);

      expect(result).toEqual([
        {
          id: 'm1',
          matchedAt: mockMatches[0].createdAt,
          lastMessage: 'Hi!',
          lastMessageAt: mockMatches[0].messages[0].createdAt,
          user: {
            id: 'u2',
            username: 'jane',
            profile: {
              name: 'Jane',
              age: 25,
              interests: [],
              photoUrl: 'photo.jpg',
            },
          },
        },
      ]);
    });

    it('should handle matches where user is the target', async () => {
      const userId = 'user-2';
      const mockMatches = [
        {
          id: 'm1',
          initiatorId: 'u1',
          targetId: userId,
          createdAt: new Date(),
          initiator: {
            id: 'u1',
            username: 'john',
            profile: {
              name: 'John',
              age: 30,
              interests: [],
              photos: [],
            },
          },
          target: { id: userId, username: 'user2' },
          messages: [],
        },
      ];
      mockPrismaService.match.findMany.mockResolvedValueOnce(mockMatches);

      const result = await service.getMatches(userId);

      expect(result[0].user.id).toBe('u1');
      expect(result[0].user.username).toBe('john');
    });
  });

  describe('undoLastSwipe', () => {
    it('should delete last swipe when no match exists', async () => {
      const userId = 'user-1';
      const lastSwipe = { id: 's1', swiperId: userId, swipedId: 'u2' };
      mockPrismaService.swipe.findFirst.mockResolvedValueOnce(lastSwipe);
      mockPrismaService.match.findFirst.mockResolvedValueOnce(null); // No match

      const result = await service.undoLastSwipe(userId);

      expect(mockPrismaService.swipe.delete).toHaveBeenCalledWith({
        where: { id: lastSwipe.id },
      });
      expect(result).toEqual({ success: true, message: 'Swipe undone' });
    });

    it('should throw NotFoundException when no swipes exist', async () => {
      mockPrismaService.swipe.findFirst.mockResolvedValueOnce(null);

      await expect(service.undoLastSwipe('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when swipe resulted in a match', async () => {
      const lastSwipe = { id: 's1', swiperId: 'user-1', swipedId: 'u2' };
      mockPrismaService.swipe.findFirst.mockResolvedValueOnce(lastSwipe);
      mockPrismaService.match.findFirst.mockResolvedValueOnce({
        id: 'm1',
      });

      await expect(service.undoLastSwipe('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
