import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
