import * as ConversationService from "../services/conversation.service";
import { requireAuth, getUserId } from "../middleware/auth.middleware";
import type { AuthenticatedSocket } from "../types";

const handleError = (
  socket: AuthenticatedSocket,
  errorMessage: string,
  error?: any
) => {
  if (error) {
    console.error("Error:", error);
  }
  socket.emit("error", { message: errorMessage });
};

const emitConversationsLoaded = (
  socket: AuthenticatedSocket,
  conversations: any
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
      console.log(`User ${userId} joined conversation ${conversationId}`);
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
    console.log(`User ${userId} left conversation ${conversationId}`);
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
    console.log(
      `Messages marked as read for user ${userId} in conversation ${conversationId}`
    );
  } catch (error) {
    console.error("Error in markAsRead handler:", error);
    handleError(socket, "Failed to mark messages as read");
  }
};

export const loadConversations = requireAuth(handleLoadConversations);
export const joinConversation = requireAuth(handleJoinConversation);
export const leaveConversation = requireAuth(handleLeaveConversation);
export const markAsRead = requireAuth(handleMarkAsRead);
