import { NextRequest } from "next/server";
import { MessagingService } from "../services/messaging.service";
import { z } from "zod";

// Validation schemas
const createConversationSchema = z.object({
  participants: z.array(z.string()).min(2),
  type: z.enum(["DIRECT", "GROUP", "SUPPORT"]).optional().default("DIRECT"),
  title: z.string().optional()
});

const sendMessageSchema = z.object({
  senderId: z.string(),
  content: z.string().min(1),
  type: z.enum(["TEXT", "IMAGE", "FILE", "LINK"]).optional().default("TEXT")
});

const markReadSchema = z.object({
  userId: z.string()
});

export class MessagingController {
  async getConversations(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new Error("User ID is required");
    }

    return await MessagingService.getUserConversations(userId);
  }

  async createConversation(request: NextRequest) {
    const body = await request.json();
    const payload = createConversationSchema.parse(body);
    return await MessagingService.createConversation(
      payload.participants,
      payload.type,
      payload.title
    );
  }

  async getMessages(request: NextRequest, conversationId: string) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      throw new Error("User ID is required");
    }

    return await MessagingService.getConversationMessages(
      conversationId,
      userId,
      page,
      limit
    );
  }

  async sendMessage(request: NextRequest, conversationId: string) {
    const body = await request.json();
    const payload = sendMessageSchema.parse(body);
    return await MessagingService.sendMessage(
      conversationId,
      payload.senderId,
      payload.content,
      payload.type
    );
  }

  async markRead(request: NextRequest, conversationId: string) {
    const body = await request.json();
    const payload = markReadSchema.parse(body);
    return await MessagingService.markMessagesAsRead(
      conversationId,
      payload.userId
    );
  }
}