import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[] | null> {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        profile: { select: { name: true, age: true } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User doesn't exist");
    return user;
  }

  async findUserByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUser(req: Request) {
    const user = (req as any).user;
    return { success: true, message: `Welcome User: ${user?.username}` };
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters',
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
        username: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            name: true,
            age: true,
            photos: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      take: 20,
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      profile: u.profile
        ? {
            name: u.profile.name,
            age: u.profile.age,
            photoUrl: u.profile.photos[0]?.url || null,
          }
        : null,
    }));
  }
}

