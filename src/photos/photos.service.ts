import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async getPhotos(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for user');
    }

    return profile.photos;
  }

  async savePhotos(
    userId: string,
    isPrimary: boolean,
    files: Express.Multer.File[],
  ) {
    console.log('[PhotosService] Saving photos for user:', userId);
    console.log(
      '[PhotosService] Files received:',
      files.map((f) => ({ filename: f.filename, path: f.path, size: f.size })),
    );

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for user');
    }

    const profileId = profile.id;

    // Ensure only first photo is primary if isPrimary is true
    if (isPrimary) {
      await this.prisma.photo.updateMany({
        where: { profileId },
        data: { isPrimary: false },
      });
    }

    const photos = files.map((file, index) => ({
      url: `${process.env.BASE_URL}/uploads/photos/${file.filename}`,
      profileId,
      isPrimary: isPrimary && index === 0,
    }));

    await this.prisma.photo.createMany({
      data: photos,
    });

    return {
      success: true,
      message: 'Photos Saved!',
    };
  }

  async setPrimaryPhoto(photoId: string, userId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { profile: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.profile.userId !== userId) {
      throw new ForbiddenException('You cannot modify this photo');
    }

    const profileId = photo.profileId;

    // Clear existing primary, then set new one
    await this.prisma.photo.updateMany({
      where: { profileId },
      data: { isPrimary: false },
    });

    await this.prisma.photo.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    return { message: 'Primary photo updated' };
  }

  async deletePhoto(photoId: string, userId: string) {
    // 🔥 1. Find photo
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { profile: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // 🔥 2. Check ownership
    if (photo.profile.userId !== userId) {
      throw new ForbiddenException('You cannot delete this photo');
    }

    // 🔥 3. Extract filename safely
    const filename = photo.url.split('/').pop();

    if (!filename) {
      throw new NotFoundException('Invalid file path');
    }

    // 🔥 4. FIXED PATH (photos, not profiles)
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'photos',
      filename,
    );

    // 🔥 5. Delete file safely
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 🔥 6. Delete from DB
    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    // 🔥 7. If deleted photo was primary, promote the most recently uploaded remaining photo
    if (photo.isPrimary) {
      const next = await this.prisma.photo.findFirst({
        where: { profileId: photo.profileId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.photo.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return {
      message: 'Photo deleted successfully',
      wasPrimary: photo.isPrimary,
    };
  }
}

