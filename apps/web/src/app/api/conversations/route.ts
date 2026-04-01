import { NextRequest } from "next/server";
import { messagingController } from "../controllers/messaging.controller";
import CatchError from "../utils/catch-error";

export const GET = CatchError(
  async (req: NextRequest) => await messagingController.getConversations(req),
);
export const POST = CatchError(
  async (req: NextRequest) =>
    await messagingController.createConversation(req),
);