import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { MatchingService } from '../matching/matching.service.js';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  async getProfiles() {
    return this.prisma.profile.findMany();
  }

  async getProfile(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async createProfile(userId: string, dto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists');
    }

    const newProfile = await this.prisma.profile.create({
      data: {
        userId,
        ...dto,
      },
    });

    // Invalidate match cache for user
    await this.matchingService.invalidateUserCache(userId);

    return {
      message: 'Profile Created!',
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        age: newProfile.age,
        interests: newProfile.interests,
      },
    };
  }

  async updateProfile(userId: string, dto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new ConflictException("Profile doesn't exist!");
    }

    if (existingProfile.userId !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this profile',
      );
    }

    const newProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
      },
    });

    // Invalidate match cache for user
    await this.matchingService.invalidateUserCache(userId);

    return {
      message: 'Profile Created!',
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        age: newProfile.age,
        interests: newProfile.interests,
      },
    };
  }
}
