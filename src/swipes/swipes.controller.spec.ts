import { Test, TestingModule } from '@nestjs/testing';
import { SwipesController } from './swipes.controller';
import { SwipesService } from './swipes.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { JwtPayload } from '../../types/express';

describe('SwipesController', () => {
  let controller: SwipesController;
  let swipesService: SwipesService;

  const mockSwipesService = {
    swipe: jest.fn(),
    getMySwipes: jest.fn(),
    getWhoLikedMe: jest.fn(),
    getMatches: jest.fn(),
    undoLastSwipe: jest.fn(),
  };

  const mockUser = { userId: 'user-1' } as JwtPayload;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwipesController],
      providers: [
        {
          provide: SwipesService,
          useValue: mockSwipesService,
        },
      ],
    }).compile();

    controller = module.get<SwipesController>(SwipesController);
    swipesService = module.get<SwipesService>(SwipesService);
    jest.clearAllMocks();
  });

  describe('swipe', () => {
    it('should call swipesService.swipe with correct arguments', async () => {
      mockSwipesService.swipe.mockResolvedValue({ matched: false });

      const result = await controller.swipe(
        { user: mockUser } as any,
        'user-2',
        'LIKE',
      );

      expect(swipesService.swipe).toHaveBeenCalledWith(
        'user-1',
        'user-2',
        'LIKE',
      );
      expect(result).toEqual({ matched: false });
    });

    it('should return match result when mutual swipe', async () => {
      const match = { id: 'm1', initiatorId: 'user-1', targetId: 'user-2' };
      mockSwipesService.swipe.mockResolvedValue({ matched: true, match });

      const result = await controller.swipe(
        { user: mockUser } as any,
        'user-2',
        'LIKE',
      );

      expect(result).toEqual({ matched: true, match });
    });
  });

  describe('getMySwipes', () => {
    it('should call swipesService.getMySwipes with userId', async () => {
      const swipes = [
        {
          id: 's1',
          action: 'LIKE',
          createdAt: new Date(),
          user: { id: 'u2', username: 'jane', profile: {} },
        },
      ];
      mockSwipesService.getMySwipes.mockResolvedValue(swipes);

      const result = await controller.getMySwipes({ user: mockUser } as any);

      expect(swipesService.getMySwipes).toHaveBeenCalledWith('user-1');
      expect(result).toBe(swipes);
    });
  });

  describe('getWhoLikedMe', () => {
    it('should call swipesService.getWhoLikedMe with userId', async () => {
      const likes = [
        {
          id: 's1',
          user: { id: 'u2', username: 'john', profile: {} },
          createdAt: new Date(),
        },
      ];
      mockSwipesService.getWhoLikedMe.mockResolvedValue(likes);

      const result = await controller.getWhoLikedMe({ user: mockUser } as any);

      expect(swipesService.getWhoLikedMe).toHaveBeenCalledWith('user-1');
      expect(result).toBe(likes);
    });
  });

  describe('getMatches', () => {
    it('should call swipesService.getMatches with userId', async () => {
      const matches = [
        {
          id: 'm1',
          matchedAt: new Date(),
          lastMessage: 'Hello',
          user: { id: 'u2', username: 'jane', profile: {} },
        },
      ];
      mockSwipesService.getMatches.mockResolvedValue(matches);

      const result = await controller.getMatches({ user: mockUser } as any);

      expect(swipesService.getMatches).toHaveBeenCalledWith('user-1');
      expect(result).toBe(matches);
    });
  });

  describe('undoLastSwipe', () => {
    it('should call swipesService.undoLastSwipe with userId', async () => {
      mockSwipesService.undoLastSwipe.mockResolvedValue({
        success: true,
        message: 'Swipe undone',
      });

      const result = await controller.undoLastSwipe({ user: mockUser } as any);

      expect(swipesService.undoLastSwipe).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ success: true, message: 'Swipe undone' });
    });
  });
});
