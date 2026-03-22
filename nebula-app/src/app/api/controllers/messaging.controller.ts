import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { messagingService } from "../services/messaging.service";
import {
  conversationCreateSchema,
  messageSendSchema,
  markMessageReadSchema,
} from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

export class MessagingController {
  async getConversations(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    const result = await messagingService.getUserConversations(userId, limit);
    return sendSuccess(result, "Conversations fetched successfully");
  }

  async createConversation(request: NextRequest) {
    const body = await request.json();
    const payload = conversationCreateSchema.parse(body);

    const result = await messagingService.createConversation(
      payload.participants,
      payload.type,
      payload.title,
    );
    const message = (result as any).isNew ? "Conversation created successfully" : "Conversation already exists";
    const status = (result as any).isNew ? 201 : 200;
    return sendSuccess(result, message, status);
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

    const result = await messagingService.getConversationMessages(
      conversationId,
      userId,
      page,
      limit,
    );
    return sendSuccess(result, "Messages fetched successfully");
  }

  async sendMessage(request: NextRequest, conversationId: string) {
    if (!conversationId) {
      throw new BadRequestException("Conversation ID is required");
    }

    const body = await request.json();
    const payload = messageSendSchema.parse(body);

    const result = await messagingService.sendMessage(
      conversationId,
      payload.senderId,
      payload.content,
      payload.type,
    );
    return sendSuccess(result, "Message sent successfully", 201);
  }

  async markRead(request: NextRequest, conversationId: string) {
    if (!conversationId) {
      throw new BadRequestException("Conversation ID is required");
    }

    const user = (request as unknown as AuthenticatedRequest).user;
    let userId = user?.id;

    if (!userId) {
      try {
        const body = await request.json();
        const payload = markMessageReadSchema.parse(body);
        userId = payload.userId;
      } catch {
        throw new BadRequestException("User identification required");
      }
    }

    const result = await messagingService.markMessagesAsRead(conversationId, userId);
    return sendSuccess(result, "Messages marked as read successfully");
  }
}

export const messagingController = new MessagingController();
