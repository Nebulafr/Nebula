import { FormattedConversation, FormattedMessage, NewMessageEmit } from "../types/index.js";
import { formatTime, formatTimestamp } from "./date.js";

type RawParticipant = {
  userId: string;
  unreadCount: number;
  user: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
    coach?: { id: string } | null;
  };
};

export const findOtherParticipant = (participants: RawParticipant[], userId: string) => {
  return participants.find((p) => p.userId !== userId);
};

export const getUserUnreadCount = (participants: RawParticipant[], userId: string): number => {
  return participants.find((p) => p.userId === userId)?.unreadCount || 0;
};

export const formatConversation = (
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
    otherUserId: otherParticipant?.user.id || "",
    coachId: otherParticipant?.user.coach?.id,
  };
};

export const isMessageFromUser = (senderId: string, userId: string): boolean => {
  return senderId === userId;
};

export const formatMessage = (msg: any, userId: string): FormattedMessage => ({
  id: msg.id,
  sender: msg.sender.fullName || "Unknown",
  content: msg.content,
  createdAt: new Date(msg.createdAt).toISOString(),
  isMe: isMessageFromUser(msg.senderId, userId),
  type: msg.type,
  isRead: msg.isRead,
  isEdited: msg.isEdited,
});

export const transformToNewMessageEmit = (message: any): NewMessageEmit => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  type: message.type,
  createdAt: message.createdAt,
  sender: {
    id: message.sender.id,
    fullName: message.sender.fullName,
    avatarUrl: message.sender.avatarUrl,
  },
});
