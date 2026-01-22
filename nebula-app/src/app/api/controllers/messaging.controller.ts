import { NextRequest } from "next/server";
import { MessagingService } from "../services/messaging.service";
import {
  conversationCreateSchema,
  messageSendSchema,
  markMessageReadSchema
} from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

export class MessagingController {
  async getConversations(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    return await MessagingService.getUserConversations(userId, limit);
  }

  async createConversation(request: NextRequest) {
    const body = await request.json();
    const payload = conversationCreateSchema.parse(body);

    return await MessagingService.createConversation(
      payload.participants,
      payload.type,
      payload.title
    );
  }

  async getMessages(request: NextRequest, conversationId: string) {
    if (!conversationId) {
      throw new BadRequestException("Conversation ID is required");
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    return await MessagingService.getConversationMessages(
      conversationId,
      userId,
      page,
      limit
    );
  }

  async sendMessage(request: NextRequest, conversationId: string) {
    if (!conversationId) {
      throw new BadRequestException("Conversation ID is required");
    }

    const body = await request.json();
    const payload = messageSendSchema.parse(body);

    return await MessagingService.sendMessage(
      conversationId,
      payload.senderId,
      payload.content,
      payload.type
    );
  }

  async markRead(request: NextRequest, conversationId: string) {
    if (!conversationId) {
      throw new BadRequestException("Conversation ID is required");
    }

    const body = await request.json();
    const payload = markMessageReadSchema.parse(body);

    return await MessagingService.markMessagesAsRead(
      conversationId,
      payload.userId
    );
  }
}
