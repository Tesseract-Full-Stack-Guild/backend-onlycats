import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async savePushToken(userId: string, token: string, device?: string) {
    const existing = await this.prisma.pushToken.findUnique({
      where: { token },
    });
    if (existing && existing.userId !== userId) {
      throw new BadRequestException('Token already registered to another user');
    }

    return this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, device, updatedAt: new Date() },
      create: { token, userId, device },
    });
  }

  async sendMatchNotification(userId: string, matchedUserId: string) {
    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
    });

    this.logger.log(
      `Would send push to ${tokens.length} tokens for user ${userId} (matched with ${matchedUserId})`,
    );

    // Integrate FCM/APNS here:
    // await this.fcm.send({ token: tokens.map(t => t.token), notification: { title: 'New Match!', body: 'You matched with someone!' } });
  }

  async sendMessageNotification(
    userId: string,
    senderId: string,
    messagePreview: string,
  ) {
    // Similar implementation for message notifications
    this.logger.log(`Message notification for user ${userId} from ${senderId}`);
  }
}
