import type { Server } from "socket.io";
import * as MessageService from "../services/message.service";
import * as ConversationService from "../services/conversation.service";
import { requireAuth, getUserId } from "../middleware/auth.middleware";
import type {
  AuthenticatedSocket,
  MessageData,
  LoadMessagesData,
} from "../types";

const extractMessageData = (data: MessageData) => ({
  conversationId: data.conversationId,
  content: data.content,
  type: data.type || "TEXT",
});

const extractLoadMessagesData = (data: LoadMessagesData) => ({
  conversationId: data.conversationId,
  page: data.page || 1,
  limit: data.limit || 50,
});

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

const emitMessagesLoaded = (socket: AuthenticatedSocket, result: any) => {
  socket.emit("messages_loaded", result);
};

const emitNewMessage = (io: Server, conversationId: string, message: any) => {
  io.to(conversationId).emit("new_message", message);
};

const emitMessageDeleted = (socket: AuthenticatedSocket, messageId: string) => {
  socket.emit("message_deleted", { messageId });
};

const emitMessageEdited = (
  socket: AuthenticatedSocket,
  messageId: string,
  content: string
) => {
  socket.emit("message_edited", { messageId, content });
};

const checkParticipantAccess = async (
  conversationId: string,
  userId: string
) => {
  return await ConversationService.isUserParticipant(conversationId, userId);
};

const handleLoadMessages = async (
  socket: AuthenticatedSocket,
  data: LoadMessagesData
) => {
  try {
    const userId = getUserId(socket)!;
    const { conversationId, page, limit } = extractLoadMessagesData(data);

    const isParticipant = await checkParticipantAccess(conversationId, userId);
    if (!isParticipant) {
      return handleError(socket, "Not authorized to access this conversation");
    }

    const result = await MessageService.getMessages(
      conversationId,
      userId,
      page,
      limit
    );
    emitMessagesLoaded(socket, result);
  } catch (error) {
    console.error("Error in loadMessages handler:", error);
    handleError(socket, "Failed to load messages");
  }
};

const handleSendMessage =
  (io: Server) => async (socket: AuthenticatedSocket, data: MessageData) => {
    try {
      const userId = getUserId(socket)!;
      const { conversationId, content, type } = extractMessageData(data);

      const isParticipant = await checkParticipantAccess(
        conversationId,
        userId
      );
      if (!isParticipant) {
        return handleError(
          socket,
          "Not authorized to send messages to this conversation"
        );
      }

      // Execute message creation and conversation updates
      const [message] = await Promise.all([
        MessageService.createMessage(conversationId, userId, content, type),
        ConversationService.updateLastMessage(conversationId, content),
        ConversationService.updateUnreadCount(conversationId, userId),
      ]);

      emitNewMessage(io, conversationId, message);
      console.log(
        `Message sent in conversation ${conversationId} by user ${userId}`
      );
    } catch (error) {
      console.error("Error in sendMessage handler:", error);
      handleError(socket, "Failed to send message");
    }
  };

const handleMarkRead = async (
  socket: AuthenticatedSocket,
  conversationId: string
) => {
  try {
    const userId = getUserId(socket)!;

    // Execute both operations in parallel
    await Promise.all([
      ConversationService.markAsRead(conversationId, userId),
      MessageService.markMessagesAsRead(conversationId, userId),
    ]);

    console.log(
      `Messages marked as read for user ${userId} in conversation ${conversationId}`
    );
  } catch (error) {
    console.error("Error in markRead handler:", error);
    handleError(socket, "Failed to mark messages as read");
  }
};

const handleDeleteMessage = async (
  socket: AuthenticatedSocket,
  messageId: string
) => {
  try {
    const userId = getUserId(socket)!;
    const success = await MessageService.deleteMessage(messageId, userId);

    if (success) {
      emitMessageDeleted(socket, messageId);
    } else {
      handleError(socket, "Unable to delete message");
    }
  } catch (error) {
    console.error("Error in deleteMessage handler:", error);
    handleError(socket, "Failed to delete message");
  }
};

const handleEditMessage = async (
  socket: AuthenticatedSocket,
  data: { messageId: string; content: string }
) => {
  try {
    const userId = getUserId(socket)!;
    const { messageId, content } = data;

    const success = await MessageService.editMessage(
      messageId,
      userId,
      content
    );

    if (success) {
      emitMessageEdited(socket, messageId, content);
    } else {
      handleError(socket, "Unable to edit message");
    }
  } catch (error) {
    console.error("Error in editMessage handler:", error);
    handleError(socket, "Failed to edit message");
  }
};

export const loadMessages = requireAuth(handleLoadMessages);
export const sendMessage = (io: Server) => requireAuth(handleSendMessage(io));
export const markRead = requireAuth(handleMarkRead);
export const deleteMessage = requireAuth(handleDeleteMessage);
export const editMessage = requireAuth(handleEditMessage);
