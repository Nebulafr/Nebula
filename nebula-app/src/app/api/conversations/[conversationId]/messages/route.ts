import { NextRequest } from "next/server";
import { MessagingController } from "../../../controllers/messaging.controller";
import CatchError from "../../../utils/catch-error";

const messagingController = new MessagingController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return CatchError(async (req: NextRequest) => {
    const { conversationId } = await params;
    return await messagingController.getMessages(req, conversationId);
  })(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return CatchError(async (req: NextRequest) => {
    const { conversationId } = await params;
    return await messagingController.sendMessage(req, conversationId);
  })(request);
}
