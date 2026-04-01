import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nebula/database';
import { formatConversation } from './utils.js';
import { Conversation } from '../types/index.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor() {}

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId },
          },
          isActive: true,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  role: true,
                  coach: {
                    select: { id: true },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return conversations.map((conv) => formatConversation(conv, userId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error loading conversations for user ${userId}: ${message}`,
      );
      throw new Error('Failed to load conversations');
    }
  }

  async isUserParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });
      return !!participant;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking participant status: ${message}`);
      return false;
    }
  }

  async updateLastMessage(
    conversationId: string,
    content: string,
  ): Promise<void> {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageTime: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error updating last message for conversation ${conversationId}: ${message}`,
      );
      throw new Error('Failed to update conversation');
    }
  }

  async updateUnreadCount(
    conversationId: string,
    excludeUserId: string,
  ): Promise<void> {
    try {
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: { not: excludeUserId },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error incrementing unread count: ${message}`);
      throw new Error('Failed to update unread count');
    }
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await prisma.conversationParticipant.updateMany({
        where: { conversationId, userId },
        data: { unreadCount: 0 },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error resetting unread count: ${message}`);
      throw new Error('Failed to mark conversation as read');
    }
  }
}
