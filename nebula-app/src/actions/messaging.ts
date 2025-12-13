import { apiGet, apiPost } from "@/lib/utils";

export async function getUserConversations(userId: string) {
  return apiGet(`/conversations?userId=${userId}`);
}

export async function createConversation(data: any) {
  return apiPost("/conversations", data);
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  limit = 50
) {
  return apiGet(
    `/conversations/${conversationId}/messages?userId=${userId}&page=${page}&limit=${limit}`
  );
}

export async function sendMessage(data: any) {
  return apiPost(`/conversations/${data.conversationId}/messages`, {
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
