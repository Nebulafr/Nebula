import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { MessageService } from './message.service.js';
import { WsAuthGuard } from '../common/guards/ws-auth.guard.js';
import type {
  AuthenticatedSocket,
  LoadMessagesData,
  MessageData,
} from '../types/index.js';

@WebSocketGateway({
  cors: {
    origin: '*', // We'll refine this in production
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    // eslint-disable-next-line prettier/prettier
  ) { }

  handleConnection(socket: AuthenticatedSocket) {
    this.logger.debug(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.debug(`Client disconnected: ${socket.id}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('load_conversations')
  async handleLoadConversations(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    if (!socket.data?.isAuthenticated) {
      return socket.emit('error', { message: 'Authentication required' });
    }

    const conversations = await this.chatService.getUserConversations(
      socket.data.userId!,
    );
    socket.emit('conversations_loaded', conversations);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    if (!socket.data?.isAuthenticated) {
      return socket.emit('error', { message: 'Authentication required' });
    }

    const isParticipant = await this.chatService.isUserParticipant(
      conversationId,
      socket.data.userId!,
    );
    if (isParticipant) {
      socket.join(conversationId);
      this.logger.debug(
        `User ${socket.data.userId} joined room ${conversationId}`,
      );
    } else {
      socket.emit('error', {
        message: 'Not authorized to join this conversation',
      });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    socket.leave(conversationId);
    this.logger.debug(
      `User ${socket.data?.userId} left room ${conversationId}`,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('load_messages')
  async handleLoadMessages(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: LoadMessagesData,
  ) {
    if (!socket.data?.isAuthenticated) {
      return socket.emit('error', { message: 'Authentication required' });
    }

    const isParticipant = await this.chatService.isUserParticipant(
      data.conversationId,
      socket.data.userId!,
    );
    if (!isParticipant) {
      return socket.emit('error', {
        message: 'Not authorized to access these messages',
      });
    }

    const result = await this.messageService.getMessages(
      data.conversationId,
      socket.data.userId!,
      data.page,
      data.limit,
    );
    socket.emit('messages_loaded', result);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: MessageData,
  ) {
    if (!socket.data?.isAuthenticated) {
      return socket.emit('error', { message: 'Authentication required' });
    }

    const isParticipant = await this.chatService.isUserParticipant(
      data.conversationId,
      socket.data.userId!,
    );
    if (!isParticipant) {
      return socket.emit('error', {
        message: 'Not authorized to send messages here',
      });
    }

    const message = await this.messageService.createMessage(
      data.conversationId,
      socket.data.userId!,
      data.content,
      data.type,
    );

    await Promise.all([
      this.chatService.updateLastMessage(data.conversationId, data.content),
      this.chatService.updateUnreadCount(
        data.conversationId,
        socket.data.userId!,
      ),
    ]);

    this.server.to(data.conversationId).emit('new_message', message);

    this.server.emit('conversation_updated', {
      conversationId: data.conversationId,
      lastMessage: data.content,
      lastMessageTime: message.createdAt,
      senderId: socket.data.userId,
      senderName: socket.data.user?.fullName || 'Someone',
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    if (!socket.data?.isAuthenticated) return;

    await Promise.all([
      this.chatService.markAsRead(conversationId, socket.data.userId!),
      this.messageService.markMessagesAsRead(
        conversationId,
        socket.data.userId!,
      ),
    ]);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    if (!socket.data?.isAuthenticated) return;

    this.server.to(conversationId).emit('typing_indicator', {
      conversationId,
      userId: socket.data.userId,
      userName: socket.data.user?.fullName || 'Someone',
      isTyping: true,
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    if (!socket.data?.isAuthenticated) return;

    this.server.to(conversationId).emit('typing_indicator', {
      conversationId,
      userId: socket.data.userId,
      userName: socket.data.user?.fullName || 'Someone',
      isTyping: false,
    });
  }
}
