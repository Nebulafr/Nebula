import { User } from "@prisma/client";
import { Socket, Server } from "socket.io";

export interface SocketData {
  userId?: string;
  user?: Pick<User, "id" | "fullName" | "role" | "status">;
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
  type?: "TEXT" | "IMAGE" | "FILE" | "LINK";
}

export interface LoadMessagesData {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface FormattedConversation {
  id: string;
  type: string;
  name: string;
  avatar?: string | null;
  lastMessage: string;
  time: string;
  unread: number;
  role: string;
}

export interface FormattedMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type: string;
  isRead: boolean;
  isEdited: boolean;
}

export interface MessagesLoadedResponse {
  conversationId: string;
  messages: FormattedMessage[];
  hasMore: boolean;
}

export interface NewMessageEmit {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: Date;
  sender: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface ServerConfig {
  port: number;
  hostname: string;
  corsOrigins: (string | RegExp)[];
}

export interface GlobalSocketServer {
  io: Server<any, any, any, SocketData>;
}

declare global {
  var socketServer: GlobalSocketServer | undefined;
}
