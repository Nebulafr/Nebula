import { apiGet, apiPost } from "@/lib/utils";
import { ConversationsResponse, ConversationMessagesResponse, ConversationResponse, MessageResponse } from "@/types/messaging";

export async function getUserConversations(userId: string, limit: number = 10): Promise<ConversationsResponse> {
  return apiGet<ConversationsResponse["data"]>(`/conversations?userId=${userId}&limit=${limit}`);
}

export async function createConversation(data: any): Promise<ConversationResponse> {
  return apiPost<ConversationResponse["data"]>("/conversations", data);
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  limit = 50
): Promise<ConversationMessagesResponse> {
  return apiGet<ConversationMessagesResponse["data"]>(
    `/conversations/${conversationId}/messages?userId=${userId}&page=${page}&limit=${limit}`
  );
}

export async function sendMessage(data: any): Promise<MessageResponse> {
  return apiPost<MessageResponse["data"]>(`/conversations/${data.conversationId}/messages`, {
    senderId: data.senderId,
    content: data.content,
    type: data.type,
  });
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  return apiPost(`/conversations/${conversationId}/read`, { userId });
}
