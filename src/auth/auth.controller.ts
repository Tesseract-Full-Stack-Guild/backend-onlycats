import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @HttpCode(201)
  @Post('register')
  async signUp(@Body() dto: RegistrationDto) {
    const res = await this.authService.signUp(dto);

    return res.message;
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);

    this.setAuthCookies(res, tokens);

    return { success: true, message: 'Login Successful!' };
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('[REFRESH] Cookies received:', req.cookies);
    const token = req.cookies.refresh_token;
    console.log('[REFRESH] Token:', token ? 'present' : 'MISSING');
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const tokens = await this.authService.refresh(token);
    this.setAuthCookies(res, tokens);
    return { success: true, message: 'Tokens Refreshed!' };
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @HttpCode(200)
  @Post('logOut')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies.refresh_token;
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie('access_token', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
    });
    return { success: true, message: 'Logged out successfully!' };
  }

  private setAuthCookies(res: Response, tokens: any) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}

