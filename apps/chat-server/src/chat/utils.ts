import {
  Conversation,
  FormattedMessage,
  NewMessageEmit,
} from '../types/index.js';
import { ConversationType, MessageType } from '@nebula/database/types';

export const calculatePagination = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const hasMoreMessages = (
  messagesLength: number,
  limit: number,
): boolean => {
  return messagesLength === limit;
};

export const formatTime = (date?: Date | string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface ConvParticipant {
  userId: string;
  unreadCount: number;
  user: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
    coach?: { id: string } | null;
  };
}

export const findOtherParticipant = (
  participants: ConvParticipant[],
  userId: string,
) => {
  return participants.find((p) => p.userId !== userId);
};

export const getUserUnreadCount = (
  participants: ConvParticipant[],
  userId: string,
): number => {
  return participants.find((p) => p.userId === userId)?.unreadCount || 0;
};

interface ConvPayload {
  id: string;
  type: ConversationType;
  messages: Array<{ content: string; createdAt: Date | string }>;
  participants: ConvParticipant[];
}

export const formatConversation = (
  conv: ConvPayload,
  userId: string,
): Conversation => {
  const otherParticipant = findOtherParticipant(conv.participants, userId);

  return {
    id: conv.id,
    type: conv.type,
    name: otherParticipant?.user.fullName || 'Unknown',
    avatar: otherParticipant?.user.avatarUrl,
    lastMessage: conv.messages[0]?.content || '',
    lastMessageTime: conv.messages[0]?.createdAt || null,
    unread: getUserUnreadCount(conv.participants, userId),
    role: otherParticipant?.user.role || 'STUDENT',
    otherUserId: otherParticipant?.user.id || '',
    coachId: otherParticipant?.user.coach?.id,
    participants: conv.participants.map((p) => ({
      id: p.user.id,
      name: p.user.fullName,
      avatar: p.user.avatarUrl,
      role: p.user.role,
    })),
  };
};

interface MsgPayload {
  id: string;
  conversationId: string;
  senderId: string | null;
  sender?: { fullName: string | null } | null;
  content: string;
  createdAt: Date | string;
  type: MessageType;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
}

export const formatMessage = (
  msg: MsgPayload,
  userId: string,
): FormattedMessage => ({
  id: msg.id,
  conversationId: msg.conversationId,
  senderId: msg.senderId,
  sender: msg.sender?.fullName || 'Unknown',
  content: msg.content,
  createdAt: new Date(msg.createdAt).toISOString(),
  isMe: msg.senderId === userId,
  type: msg.type,
  isRead: msg.isRead,
  isEdited: msg.isEdited,
  isDeleted: msg.isDeleted,
});

export const transformToNewMessageEmit = (
  message: MsgPayload,
  userId: string,
): NewMessageEmit => formatMessage(message, userId);
