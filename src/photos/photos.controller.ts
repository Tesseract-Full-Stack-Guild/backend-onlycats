import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Request } from 'express';
import type { JwtPayload } from '../../types/express.js';
import { AuthGuard } from '@nestjs/passport';
import { existsSync, mkdirSync } from 'fs';
import { Throttle } from '@nestjs/throttler';

const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'photos');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}
console.log('[PhotosController] Upload path:', uploadPath);

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getPhotos(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.photosService.getPhotos(user.userId);
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 6, {
      storage: diskStorage({
        destination: uploadPath,

        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image')) {
          return cb(new Error('Only images allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('isPrimary') isPrimary: boolean,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    const res = await this.photosService.savePhotos(
      user.userId,
      isPrimary,
      files,
    );
    return res.message;
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':photoId')
  async deletePhoto(@Param('photoId') photoId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.photosService.deletePhoto(photoId, user.userId);
  }
}
