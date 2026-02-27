import { prisma } from "@/lib/prisma";
import { MessageType, ConversationType, Prisma } from "@/generated/prisma";
import { sendSuccess } from "../utils/send-response";
import {
  UnauthorizedException,
} from "../utils/http-exception";

export class MessagingService {
  async getUserConversations(userId: string, limit: number = 10) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
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
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageTime: "desc",
      },
      take: limit,
    });

    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== userId
      );
      const currentUserParticipant = conversation.participants.find(
        (p) => p.userId === userId
      );
      const lastMessage = conversation.messages[0];

      return {
        id: conversation.id,
        type: conversation.type,
        name:
          conversation.title || otherParticipant?.user.fullName || "Unknown",
        avatar: otherParticipant?.user.avatarUrl || null,
        lastMessage: lastMessage?.content || conversation.lastMessage || "",
        time: conversation.lastMessageTime
          ? new Date(conversation.lastMessageTime).toLocaleString()
          : "",
        unread: currentUserParticipant?.unreadCount || 0,
        otherUserId: otherParticipant?.user.id,
        coachId: otherParticipant?.user.coach?.id,
        role: otherParticipant?.user.role || "STUDENT",
        participants: conversation.participants.map((p) => ({
          id: p.user.id,
          name: p.user.fullName,
          avatar: p.user.avatarUrl,
          role: p.user.role,
        })),
      };
    });

    return sendSuccess(
      formattedConversations,
      "Conversations fetched successfully"
    );
  }

  async createConversation(
    participants: string[],
    type: ConversationType = "DIRECT",
    title?: string
  ) {
    if (participants.length < 2) {
      throw new Error("At least 2 participants are required");
    }

    // Check if a direct conversation already exists between these users
    if (type === "DIRECT" && participants.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          participants: {
            every: {
              userId: {
                in: participants,
              },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (
        existingConversation &&
        existingConversation.participants.length === 2
      ) {
        return sendSuccess(
          {
            id: existingConversation.id,
            isNew: false,
          },
          "Conversation already exists"
        );
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type,
        title,
        participants: {
          create: participants.map((userId: string) => ({
            userId,
          })),
        },
      },
    });

    return sendSuccess(
      {
        id: conversation.id,
        isNew: true,
      },
      "Conversation created successfully",
      201
    );
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
    // Verify user is a participant
    const participant = await this.verifyParticipant(conversationId, userId);
    if (!participant) {
      throw new UnauthorizedException(
        "Not authorized to view this conversation"
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedMessages = messages.reverse().map((message) => ({
      id: message.id,
      sender: message.sender.fullName || "Unknown",
      text: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: message.senderId === userId,
      type: message.type,
      isRead: message.isRead,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      attachments: message.attachments,
    }));

    return sendSuccess(
      {
        messages: formattedMessages,
        hasMore: messages.length === limit,
      },
      "Messages fetched successfully"
    );
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = "TEXT"
  ) {
    return await prisma.$transaction(async (tx) => {
      // Verify user is a participant
      const participant = await this.verifyParticipant(conversationId, senderId, tx);
      if (!participant) {
        throw new UnauthorizedException(
          "Not authorized to send messages to this conversation"
        );
      }

      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update conversation with last message
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageTime: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update unread count for other participants
      await tx.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: { not: senderId },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });

      return sendSuccess(
        {
          id: message.id,
        },
        "Message sent successfully",
        201
      );
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId,
        },
        data: {
          unreadCount: 0,
        },
      });

      await tx.message.updateMany({
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

      return sendSuccess(null, "Messages marked as read successfully");
    });
  }

  private async verifyParticipant(
    conversationId: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ) {
    const prismaClient = tx || prisma;
    return await prismaClient.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });
  }
}

export const messagingService = new MessagingService();
