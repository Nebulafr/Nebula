import { ApiResponse } from "./api";

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  title?: string | null;
  lastMessage?: string | null;
  lastMessageTime?: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  participants: Array<{
    userId: string;
    fullName: string | null;
    avatarUrl: string | null;
  }>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string | null;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE";
  isAi: boolean;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  readAt?: string | Date | null;
  editedAt?: string | Date | null;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export type ConversationsResponse = ApiResponse<Conversation[]>;
export type ConversationMessagesResponse = ApiResponse<Message[]>;
export type ConversationResponse = ApiResponse<Conversation>;
export type MessageResponse = ApiResponse<Message>;
