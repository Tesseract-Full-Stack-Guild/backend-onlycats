import { Test, TestingModule } from '@nestjs/testing';
import { PhotosService } from './photos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PhotosService', () => {
  let service: PhotosService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
              updateMany: jest.fn(),
            },
            photo: {
              findUnique: jest.fn(),
              createMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
