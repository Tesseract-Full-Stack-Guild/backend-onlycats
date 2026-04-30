import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import type { Request } from 'express';
import type { JwtPayload } from '../../types/express';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfiles() {
    return this.profileService.getProfiles();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createProfile(@Body() dto: CreateProfileDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.profileService.createProfile(user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateProfile(@Body() dto: CreateProfileDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.profileService.updateProfile(user.userId, dto);
  }
}

