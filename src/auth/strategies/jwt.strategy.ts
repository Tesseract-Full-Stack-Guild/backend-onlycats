import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../types/express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req?.cookies?.access_token;
        },
      ]),
      secretOrKey: process.env.ACCESS_SECRET || 'dev_secret',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JwtStrategy validate payload:', payload);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // ✅ This becomes req.user
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}

