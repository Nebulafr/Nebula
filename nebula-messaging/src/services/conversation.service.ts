import { prisma } from "../lib/prisma";
import type { FormattedConversation } from "../types";

const findOtherParticipant = (participants: any[], userId: string) => {
  return participants.find((p: any) => p.userId !== userId);
};

const formatTime = (date: Date | null): string => {
  return date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
};

const getUserUnreadCount = (participants: any[], userId: string): number => {
  return participants.find((p: any) => p.userId === userId)?.unreadCount || 0;
};

const formatConversation = (
  conv: any,
  userId: string
): FormattedConversation => {
  const otherParticipant = findOtherParticipant(conv.participants, userId);

  return {
    id: conv.id,
    type: conv.type,
    name: otherParticipant?.user.fullName || "Unknown",
    avatar: otherParticipant?.user.avatarUrl,
    lastMessage: conv.messages[0]?.content || "",
    time: formatTime(conv.messages[0]?.createdAt),
    unread: getUserUnreadCount(conv.participants, userId),
    role: otherParticipant?.user.role || "STUDENT",
  };
};

const formatConversations = (
  conversations: any[],
  userId: string
): FormattedConversation[] => {
  return conversations.map((conv) => formatConversation(conv, userId));
};

const fetchUserConversations = async (userId: string) => {
  return await prisma.conversation.findMany({
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
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

const fetchParticipant = async (conversationId: string, userId: string) => {
  return await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
};

const updateConversationLastMessage = async (
  conversationId: string,
  content: string
) => {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: content,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    },
  });
};

const incrementUnreadCount = async (
  conversationId: string,
  excludeUserId: string
) => {
  return await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: excludeUserId },
    },
    data: {
      unreadCount: { increment: 1 },
    },
  });
};

const resetUnreadCount = async (conversationId: string, userId: string) => {
  return await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { unreadCount: 0 },
  });
};

export const getUserConversations = async (
  userId: string
): Promise<FormattedConversation[]> => {
  try {
    const conversations = await fetchUserConversations(userId);
    return formatConversations(conversations, userId);
  } catch (error) {
    console.error("Error loading conversations:", error);
    throw new Error("Failed to load conversations");
  }
};

export const isUserParticipant = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const participant = await fetchParticipant(conversationId, userId);
    return !!participant;
  } catch (error) {
    console.error("Error checking participant status:", error);
    return false;
  }
};

export const updateLastMessage = async (
  conversationId: string,
  content: string
): Promise<void> => {
  try {
    await updateConversationLastMessage(conversationId, content);
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw new Error("Failed to update conversation");
  }
};

export const updateUnreadCount = async (
  conversationId: string,
  excludeUserId: string
): Promise<void> => {
  try {
    await incrementUnreadCount(conversationId, excludeUserId);
  } catch (error) {
    console.error("Error updating unread count:", error);
    throw new Error("Failed to update unread count");
  }
};

export const markAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    await resetUnreadCount(conversationId, userId);
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw new Error("Failed to mark conversation as read");
  }
};
