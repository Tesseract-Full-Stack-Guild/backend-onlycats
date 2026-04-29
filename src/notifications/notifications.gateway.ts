import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ origin: '*' })
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<string, string>();
  private logger = new Logger('NotificationsGateway');

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit() {
    this.logger.log('Notifications WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.onlineUsers.set(userId, client.id);
      this.logger.log(
        `User ${userId} connected for notifications with socket ID: ${client.id}`,
      );
    } else {
      this.logger.warn('Client connected for notifications without userId');
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected from notifications`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMatchNotification')
  async handleSendMatchNotification(
    @MessageBody() data: { userId: string; matchedUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.notificationsService.sendMatchNotification(
        data.userId,
        data.matchedUserId,
      );

      // Notify the recipient if online
      const recipientSocketId = this.onlineUsers.get(data.userId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('matchNotification', {
          type: 'match',
          matchedUserId: data.matchedUserId,
          timestamp: new Date(),
        });
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Error sending match notification: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('sendMessageNotification')
  async handleSendMessageNotification(
    @MessageBody()
    data: { userId: string; senderId: string; messagePreview: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.notificationsService.sendMessageNotification(
        data.userId,
        data.senderId,
        data.messagePreview,
      );

      // Notify the recipient if online
      const recipientSocketId = this.onlineUsers.get(data.userId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('messageNotification', {
          type: 'message',
          senderId: data.senderId,
          messagePreview: data.messagePreview,
          timestamp: new Date(),
        });
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Error sending message notification: ${error.message}`);
      return { error: error.message };
    }
  }
}
