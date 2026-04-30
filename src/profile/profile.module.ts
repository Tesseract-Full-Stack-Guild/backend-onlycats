import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [PrismaModule, MatchingModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}

