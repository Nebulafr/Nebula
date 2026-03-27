import type { Conversation, Message } from "@nebula/database/types";
export type { Conversation, Message };
import { ApiResponse } from "./index";

export type ConversationsResponse = ApiResponse<Conversation[]>;

export type ConversationMessagesResponse = ApiResponse<Message[]>;

export type ConversationResponse = ApiResponse<Conversation>;

export type MessageResponse = ApiResponse<Message>;
