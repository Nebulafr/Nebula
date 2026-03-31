import {
  Conversation,
  FormattedMessage,
  NewMessageEmit,
} from '../types/index.js';

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

export const findOtherParticipant = (participants: any[], userId: string) => {
  return participants.find((p: any) => p.userId !== userId);
};

export const getUserUnreadCount = (
  participants: any[],
  userId: string,
): number => {
  return participants.find((p: any) => p.userId === userId)?.unreadCount || 0;
};

export const formatConversation = (conv: any, userId: string): Conversation => {
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
    participants: conv.participants.map((p: any) => ({
      id: p.user.id,
      name: p.user.fullName,
      avatar: p.user.avatarUrl,
      role: p.user.role,
    })),
  };
};

export const formatMessage = (msg: any, userId: string): FormattedMessage => ({
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
  message: any,
  userId: string,
): NewMessageEmit => formatMessage(message, userId);
