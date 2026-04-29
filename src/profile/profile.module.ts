import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { ProfileController } from './profile.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MatchingModule } from '../matching/matching.module.js';

@Module({
  imports: [PrismaModule, MatchingModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
