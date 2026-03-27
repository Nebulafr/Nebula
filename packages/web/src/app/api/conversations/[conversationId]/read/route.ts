import { NextRequest } from "next/server";
import { isAuthenticated } from "@/app/api/middleware/auth";
import CatchError from "@/app/api/utils/catch-error";
import { messagingController } from "@/app/api/controllers/messaging.controller";

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ conversationId: string }> },
    ) => {
      const { conversationId } = await context.params;
      return await messagingController.markRead(request, conversationId);
    },
  ),
);