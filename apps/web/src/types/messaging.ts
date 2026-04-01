import { ApiResponse } from "./api";

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP" | "SUPPORT" | "AI";
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
  type: "TEXT" | "IMAGE" | "FILE" | "LINK";
  isMe?: boolean;
  isAi?: boolean;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  readAt?: string | Date | null;
  editedAt?: string | Date | null;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface CreateConversationPayload {
  participants: string[];
  type?: "DIRECT" | "GROUP" | "SUPPORT";
  title?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "LINK";
}

export type ConversationsResponse = ApiResponse<Conversation[]>;
export type ConversationMessagesResponse = ApiResponse<{
  messages: FormattedMessage[];
  hasMore: boolean;
}>;
export type ConversationResponse = ApiResponse<Conversation>;
export type MessageResponse = ApiResponse<FormattedMessage>;
