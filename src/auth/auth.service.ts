import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationDto } from './dto/registration.dto';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private user: UsersService,
    private jwt: JwtService,
  ) {}

  async signUp(registerDto: RegistrationDto) {
    const { username, email, password } = registerDto;

    let existing = await this.prisma.user.findUnique({ where: { username } });

    if (existing) throw new BadRequestException('Username already taken');

    existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) throw new BadRequestException('Email already used');

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return {
      message: 'User registered successfully!',
      newUser,
    };
  }

  async validateUser(loginDto: LoginDto) {
    const { usernameOrEmail, password } = loginDto;

    let user = await this.user.findUserByUsername(usernameOrEmail);

    if (!user) {
      user = await this.user.findUserByEmail(usernameOrEmail);

      if (!user) throw new UnauthorizedException('Invalid username/password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('No password set for user');
    }

    const comparePassword = await bcrypt.compare(password, user.passwordHash);

    if (!comparePassword)
      throw new UnauthorizedException('Invalid username/password');

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string, token: string) {
    const tokensInDB = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    if (!tokensInDB)
      throw new UnauthorizedException('Invalid or expired token!');

    for (const t of tokensInDB) {
      const match = await bcrypt.compare(token, t.tokenHash);

      if (match) return t;
    }

    throw new UnauthorizedException('Invalid refresh token!');
  }

  async refresh(oldToken: string) {
    const payload = await this.jwt.verify(oldToken, {
      secret: process.env.REFRESH_SECRET,
    });

    const userId = payload.sub;

    const existingToken = await this.validateRefreshToken(userId, oldToken);

    if (!existingToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedException('Token reuse detected!');
    }

    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const newPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwt.sign(newPayload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(newPayload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    const payload = await this.jwt.verify(token, {
      secret: process.env.REFRESH_SECRET,
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: payload.sub },
      data: { revokedAt: new Date() },
    });
  }
}

