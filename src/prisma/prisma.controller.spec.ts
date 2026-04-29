import { Test, TestingModule } from '@nestjs/testing';
import { PrismaController } from './prisma.controller.js';
import { PrismaService } from './prisma.service.js';

describe('PrismaController', () => {
  let controller: PrismaController;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: { findMany: jest.fn(), findUnique: jest.fn() },
    profile: { findMany: jest.fn(), findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrismaController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<PrismaController>(PrismaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
