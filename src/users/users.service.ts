import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from '../../generated/prisma/client.js';
import type { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[] | null> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    const user = this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    return user;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  async getUser(req: Request) {
    return { succees: true, message: `Welcome User: ${req.user}` };
  }

  async getAmdin(req: Request) {
    return { success: true, message: `Welcome admin: ${req.user}` };
  }
}
