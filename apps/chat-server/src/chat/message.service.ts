import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nebula/database';
import {
  calculatePagination,
  formatMessage,
  hasMoreMessages,
  transformToNewMessageEmit,
} from './utils.js';
import { MessagesLoadedResponse, NewMessageEmit } from '../types/index.js';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor() { }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<MessagesLoadedResponse> {
    try {
      const { skip, take } = calculatePagination(page, limit);

      const messages = await prisma.message.findMany({
        where: { conversationId, isDeleted: false },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      });

      const formattedMessages = messages.map((msg) =>
        formatMessage(msg, userId),
      );

      return {
        conversationId,
        messages: formattedMessages,
        hasMore: hasMoreMessages(messages.length, limit),
      };
    } catch (error: any) {
      this.logger.error(
        `Error loading messages for conversation ${conversationId}: ${error.message}`,
      );
      throw new Error('Failed to load messages');
    }
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: any = 'TEXT',
  ): Promise<NewMessageEmit> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type,
          isRead: false,
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      return transformToNewMessageEmit(message, senderId);
    } catch (error: any) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw new Error('Failed to create message');
    }
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      throw new Error('Failed to mark messages as read');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const message = await prisma.message.findFirst({
        where: { id: messageId, senderId: userId },
      });

      if (!message) return false;

      await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true },
      });
      return true;
    } catch (error: any) {
      this.logger.error(
        `Error deleting message ${messageId}: ${error.message}`,
      );
      return false;
    }
  }

  async editMessage(
    messageId: string,
    userId: string,
    newContent: string,
  ): Promise<boolean> {
    try {
      const message = await prisma.message.findFirst({
        where: { id: messageId, senderId: userId },
      });

      if (!message) return false;

      await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
          editedAt: new Date(),
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error(`Error editing message ${messageId}: ${error.message}`);
      return false;
    }
  }
}
