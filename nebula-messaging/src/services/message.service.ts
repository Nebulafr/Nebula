import { prisma } from "../lib/prisma";
import type { MessageType } from "../../generated/prisma";
import type {
  FormattedMessage,
  MessagesLoadedResponse,
  NewMessageEmit,
} from "../types";

const formatTimestamp = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isMessageFromUser = (senderId: string, userId: string): boolean => {
  return senderId === userId;
};

const formatMessage = (msg: any, userId: string): FormattedMessage => ({
  id: msg.id,
  sender: msg.sender.fullName || "Unknown",
  text: msg.content,
  timestamp: formatTimestamp(msg.createdAt),
  isMe: isMessageFromUser(msg.senderId, userId),
  type: msg.type,
  isRead: msg.isRead,
  isEdited: msg.isEdited,
});

const formatMessages = (
  messages: any[],
  userId: string
): FormattedMessage[] => {
  return messages.map((msg) => formatMessage(msg, userId));
};

const calculatePagination = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});

const hasMoreMessages = (messagesLength: number, limit: number): boolean => {
  return messagesLength === limit;
};

const fetchMessages = async (
  conversationId: string,
  page: number,
  limit: number
) => {
  const { skip, take } = calculatePagination(page, limit);

  return await prisma.message.findMany({
    where: { conversationId, isDeleted: false },
    include: {
      sender: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
    skip,
    take,
  });
};

const createMessageInDb = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: MessageType
) => {
  return await prisma.message.create({
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
};

const markMessagesReadInDb = async (conversationId: string, userId: string) => {
  return await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

const countMessages = async (conversationId: string) => {
  return await prisma.message.count({
    where: { conversationId, isDeleted: false },
  });
};

const countUnreadMessages = async (conversationId: string) => {
  return await prisma.message.count({
    where: { conversationId, isDeleted: false, isRead: false },
  });
};

const findMessageByIdAndUser = async (messageId: string, userId: string) => {
  return await prisma.message.findFirst({
    where: { id: messageId, senderId: userId },
  });
};

const softDeleteMessage = async (messageId: string) => {
  return await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true },
  });
};

const updateMessageContent = async (messageId: string, newContent: string) => {
  return await prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent,
      isEdited: true,
    },
  });
};

const transformToNewMessageEmit = (message: any): NewMessageEmit => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  type: message.type,
  createdAt: message.createdAt,
  sender: message.sender,
});

export const getMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesLoadedResponse> => {
  try {
    const messages = await fetchMessages(conversationId, page, limit);
    const formattedMessages = formatMessages(messages, userId);

    return {
      conversationId,
      messages: formattedMessages,
      hasMore: hasMoreMessages(messages.length, limit),
    };
  } catch (error) {
    console.error("Error loading messages:", error);
    throw new Error("Failed to load messages");
  }
};

export const createMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: MessageType = "TEXT"
): Promise<NewMessageEmit> => {
  try {
    const message = await createMessageInDb(
      conversationId,
      senderId,
      content,
      type
    );
    return transformToNewMessageEmit(message);
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to create message");
  }
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    await markMessagesReadInDb(conversationId, userId);
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
};

export const getMessageStats = async (conversationId: string) => {
  try {
    const [totalMessages, unreadMessages] = await Promise.all([
      countMessages(conversationId),
      countUnreadMessages(conversationId),
    ]);

    return { totalMessages, unreadMessages };
  } catch (error) {
    console.error("Error getting message stats:", error);
    return { totalMessages: 0, unreadMessages: 0 };
  }
};

export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<boolean> => {
  try {
    const message = await findMessageByIdAndUser(messageId, userId);

    if (!message) {
      return false;
    }

    await softDeleteMessage(messageId);
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

export const editMessage = async (
  messageId: string,
  userId: string,
  newContent: string
): Promise<boolean> => {
  try {
    const message = await findMessageByIdAndUser(messageId, userId);

    if (!message) {
      return false;
    }

    await updateMessageContent(messageId, newContent);
    return true;
  } catch (error) {
    console.error("Error editing message:", error);
    return false;
  }
};
