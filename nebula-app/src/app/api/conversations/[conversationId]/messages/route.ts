import { NextRequest } from "next/server";
import { messagingController } from "../../../controllers/messaging.controller";
import CatchError from "../../../utils/catch-error";

export const GET = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ conversationId: string }> },
  ) => {
    const { conversationId } = await context.params;
    return await messagingController.getMessages(request, conversationId);
  },
);

export const POST = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ conversationId: string }> },
  ) => {
    const { conversationId } = await context.params;
    return await messagingController.sendMessage(request, conversationId);
  },
);
