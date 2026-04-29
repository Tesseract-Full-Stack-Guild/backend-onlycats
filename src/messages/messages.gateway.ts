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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ origin: '*' })
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<string, string>();
  private logger = new Logger('MessagesGateway');

  constructor(private readonly messagesService: MessagesService) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.onlineUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ID: ${client.id}`);
    } else {
      this.logger.warn('Client connected without userId');
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.sendMessage(userId, dto);

      // Notify receiver if online
      const receiverSocketId = this.onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }

      // Also notify sender (useful for updating their UI)
      this.server.to(client.id).emit('messageSent', message);

      return message;
    } catch (error: any) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { error: error.message };
    }
  }
}
