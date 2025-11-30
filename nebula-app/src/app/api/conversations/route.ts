import { NextRequest } from "next/server";
import { MessagingController } from "../controllers/messaging.controller";
import CatchError from "../utils/catch-error";

const messagingController = new MessagingController();

export const GET = CatchError(messagingController.getConversations);
export const POST = CatchError(messagingController.createConversation);