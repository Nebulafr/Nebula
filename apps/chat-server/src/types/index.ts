import { User, ConversationType, MessageType } from '@nebula/database/types';
import { Socket } from 'socket.io';

export interface SocketData {
  userId?: string;
  user?: Pick<User, 'id' | 'fullName' | 'role' | 'status'>;
  isAuthenticated: boolean;
}

export interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export interface JwtPayload {
  userId: string;
  [key: string]: any;
}

export interface MessageData {
  conversationId: string;
  content: string;
  type?: MessageType;
}

export interface LoadMessagesData {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar?: string | null;
  lastMessage?: string | null;
  lastMessageTime?: string | Date | null;
  unread: number;
  otherUserId?: string;
  coachId?: string;
  role?: string;
  participants: Array<{
    id: string;
    name: string | null;
    avatar: string | null;
    role: string;
  }>;
}

export interface FormattedMessage {
  id: string;
  conversationId: string;
  senderId?: string | null;
  sender?: string;
  content: string;
  type: MessageType;
  isMe?: boolean;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  readAt?: string | Date | null;
  editedAt?: string | Date | null;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface MessagesLoadedResponse {
  conversationId: string;
  messages: FormattedMessage[];
  hasMore: boolean;
}

export type NewMessageEmit = FormattedMessage;
