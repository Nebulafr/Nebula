import * as ConversationService from "../services/conversation.service.js";
import { requireAuth, getUserId } from "../middleware/auth.middleware.js";
import type { AuthenticatedSocket, FormattedConversation } from "../types/index.js";

const handleError = (
  socket: AuthenticatedSocket,
  errorMessage: string,
  error?: unknown
) => {
  if (error) {
    console.error("Error:", error);
  }
  socket.emit("error", { message: errorMessage });
};

const emitConversationsLoaded = (
  socket: AuthenticatedSocket,
  conversations: FormattedConversation[]
) => {
  socket.emit("conversations_loaded", conversations);
};

const joinSocketRoom = (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  socket.join(conversationId);
};

const leaveSocketRoom = (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  socket.leave(conversationId);
};

const checkParticipantAccess = async (
  conversationId: string,
  userId: string
) => {
  return await ConversationService.isUserParticipant(conversationId, userId);
};

const handleLoadConversations = async (socket: AuthenticatedSocket) => {
  try {
    const userId = getUserId(socket)!;
    const conversations = await ConversationService.getUserConversations(
      userId
    );
    emitConversationsLoaded(socket, conversations);
  } catch (error) {
    console.error("Error in loadConversations handler:", error);
    handleError(socket, "Failed to load conversations");
  }
};

const handleJoinConversation = async (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  try {
    const userId = getUserId(socket)!;

    const isParticipant = await checkParticipantAccess(conversationId, userId);

    if (isParticipant) {
      joinSocketRoom(socket, conversationId);
    } else {
      handleError(socket, "Not authorized to join this conversation");
    }
  } catch (error) {
    console.error("Error in joinConversation handler:", error);
    handleError(socket, "Failed to join conversation");
  }
};

const handleLeaveConversation = async (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  try {
    const userId = getUserId(socket)!;

    leaveSocketRoom(socket, conversationId);
  } catch (error) {
    console.error("Error in leaveConversation handler:", error);
    handleError(socket, "Failed to leave conversation");
  }
};

const handleMarkAsRead = async (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  try {
    const userId = getUserId(socket)!;

    await ConversationService.markAsRead(conversationId, userId);
  } catch (error) {
    console.error("Error in markAsRead handler:", error);
    handleError(socket, "Failed to mark messages as read");
  }
};

export const loadConversations = requireAuth(handleLoadConversations);
export const joinConversation = requireAuth(handleJoinConversation);
export const leaveConversation = requireAuth(handleLeaveConversation);
export const markAsRead = requireAuth(handleMarkAsRead);
