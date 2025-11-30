import { MessageType, ConversationType } from "@/generated/prisma";

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  role: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type: MessageType;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  attachments?: any[];
}

export interface CreateConversationData {
  participants: string[];
  type?: ConversationType;
  title?: string;
}

export interface SendMessageData {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const response = await fetch(`/api/conversations?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch conversations");
    }

    return result.data;
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    throw new Error(error.message || "Failed to fetch conversations");
  }
}

export interface CreateConversationResponse {
  success: boolean;
  data?: { id: string; isNew: boolean };
  error?: string;
  message?: string;
}

export async function createConversation(data: CreateConversationData): Promise<CreateConversationResponse> {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.message || "Failed to create conversation"
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return {
      success: false,
      error: error.message || "Failed to create conversation"
    };
  }
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  limit = 50
): Promise<{ messages: Message[]; hasMore: boolean }> {
  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages?userId=${userId}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch messages");
    }

    return result.data;
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    throw new Error(error.message || "Failed to fetch messages");
  }
}

export async function sendMessage(data: SendMessageData): Promise<{ id: string }> {
  try {
    const response = await fetch(`/api/conversations/${data.conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: data.senderId,
        content: data.content,
        type: data.type
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to send message");
    }

    return result.data;
  } catch (error: any) {
    console.error("Error sending message:", error);
    throw new Error(error.message || "Failed to send message");
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to mark messages as read");
    }
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    throw new Error(error.message || "Failed to mark messages as read");
  }
}