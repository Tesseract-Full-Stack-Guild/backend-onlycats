import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { PhotosController } from './photos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
