import { Server as SocketServer } from "socket.io";
import { prisma } from "@/lib/prisma";
import { MessageType } from "@/generated/prisma";
import jwt from "jsonwebtoken";

export class SocketService {
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
  }

  setupSocketEvents() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log({ token });
        if (!token) {
          console.log(
            "Socket connection without auth token - allowing in development"
          );
          socket.data.isAuthenticated = false;
          return next();
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
        const decoded = jwt.verify(token, secret) as any;

        try {
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, fullName: true, role: true, status: true },
          });

          if (!user || user.status !== "ACTIVE") {
            console.log(
              "Invalid user or inactive account - allowing connection but marking as unauthenticated"
            );
            socket.data.isAuthenticated = false;
            return next();
          }

          socket.data.userId = user.id;
          socket.data.user = user;
          socket.data.isAuthenticated = true;
          next();
        } catch (dbError) {
          console.error(
            "Database connection error during socket auth:",
            dbError instanceof Error ? dbError.message : String(dbError)
          );
          socket.data.isAuthenticated = false;
          return next();
        }
      } catch (error) {
        console.error("Socket authentication error:", error);
        socket.data.isAuthenticated = false;
        next();
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      const isAuthenticated = socket.data.isAuthenticated;
      console.log(
        "Client connected:",
        socket.id,
        "User:",
        userId,
        "Authenticated:",
        isAuthenticated
      );

      if (isAuthenticated && userId) {
        socket.join(`user_${userId}`);
      }

      socket.on("join_conversation", async (conversationId: string) => {
        if (!isAuthenticated || !userId) {
          return socket.emit("error", { message: "Authentication required" });
        }

        try {
          const isAuthorized = await this.verifyParticipant(
            conversationId,
            userId
          );
          if (isAuthorized) {
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation ${conversationId}`);
          } else {
            socket.emit("error", {
              message: "Not authorized to join this conversation",
            });
          }
        } catch (error) {
          console.error("Error joining conversation:", error);
          socket.emit("error", { message: "Failed to join conversation" });
        }
      });

      socket.on(
        "send_message",
        async (data: {
          conversationId: string;
          content: string;
          type?: MessageType;
        }) => {
          if (!isAuthenticated || !userId) {
            return socket.emit("error", { message: "Authentication required" });
          }

          try {
            const message = await this.handleSendMessage({
              ...data,
              senderId: userId,
            });
            if (message) {
              this.io.to(data.conversationId).emit("new_message", message);
            }
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      socket.on("mark_read", async (conversationId: string) => {
        if (!isAuthenticated || !userId) {
          return socket.emit("error", { message: "Authentication required" });
        }

        try {
          await this.handleMarkRead(conversationId, userId);
          console.log(
            `Messages marked as read for user ${userId} in conversation ${conversationId}`
          );
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      socket.on("leave_conversation", (conversationId: string) => {
        if (!isAuthenticated || !userId) {
          return socket.emit("error", { message: "Authentication required" });
        }

        socket.leave(conversationId);
        console.log(`User ${userId} left conversation ${conversationId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  private async verifyParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });
    return !!participant;
  }

  private async handleSendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
  }) {
    const { conversationId, senderId, content, type = "TEXT" } = data;

    // Verify user is a participant
    const isAuthorized = await this.verifyParticipant(conversationId, senderId);
    if (!isAuthorized) {
      throw new Error("Not authorized to send messages to this conversation");
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation with last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update unread count for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      sender: message.sender,
    };
  }

  private async handleMarkRead(conversationId: string, userId: string) {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        unreadCount: 0,
      },
    });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Method to emit events from outside the socket context (e.g., from API routes)
  emitToConversation(conversationId: string, event: string, data: any) {
    this.io.to(conversationId).emit(event, data);
  }

  // Method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }
}
