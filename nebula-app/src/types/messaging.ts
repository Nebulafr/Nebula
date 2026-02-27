import { Conversation, Message } from "@/generated/prisma";
import { ApiResponse } from "./index";

export type ConversationsResponse = ApiResponse<Conversation[]>;

export type ConversationMessagesResponse = ApiResponse<Message[]>;

export type ConversationResponse = ApiResponse<Conversation>;

export type MessageResponse = ApiResponse<Message>;
