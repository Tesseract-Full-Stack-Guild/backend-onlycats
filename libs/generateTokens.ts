import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

export class Tokens {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: 'ACCESS_TOKEN',
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: 'REFRESH_TOKEN',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async storeTokenDB(userId: string, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
