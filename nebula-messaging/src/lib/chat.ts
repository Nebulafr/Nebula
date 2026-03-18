import { FormattedConversation, FormattedMessage, NewMessageEmit } from "../types";
import { formatTime, formatTimestamp } from "./date";

export const findOtherParticipant = (participants: any[], userId: string) => {
  return participants.find((p: any) => p.userId !== userId);
};

export const getUserUnreadCount = (participants: any[], userId: string): number => {
  return participants.find((p: any) => p.userId === userId)?.unreadCount || 0;
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
  text: msg.content,
  timestamp: formatTimestamp(msg.createdAt),
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
  sender: message.sender,
});
