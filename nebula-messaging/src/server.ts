import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const port = parseInt(process.env.PORT || "9001");
const hostname = "0.0.0.0";

const httpServer = createServer();

interface SocketData {
  userId?: string;
  user?: Pick<User, "id" | "fullName" | "role" | "status">;
  isAuthenticated: boolean;
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

interface MessageData {
  conversationId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "LINK";
}

const io = new Server<any, any, any, SocketData>(httpServer, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "http://localhost:3000",
      "https://*.vercel.app",
      /https:\/\/.*\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    const token = socket.handshake.auth.token as string;

    if (!token) {
      console.log(
        "Socket connection without auth token - allowing but marking as unauthenticated"
      );
      socket.data.isAuthenticated = false;
      return next();
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Verify user exists
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, fullName: true, role: true, status: true },
      });

      if (!user || user.status !== "ACTIVE") {
        console.log(
          "Invalid user or inactive account - allowing but marking as unauthenticated"
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

// Socket event handlers
io.on("connection", (socket: AuthenticatedSocket) => {
  const { userId, isAuthenticated } = socket.data;

  console.log(
    `Client connected: ${socket.id} User: ${
      userId || "undefined"
    } Authenticated: ${isAuthenticated}`
  );

  // Load user conversations
  socket.on("load_conversations", async () => {
    if (!isAuthenticated || !userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId },
          },
          isActive: true,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      const formattedConversations = conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId !== userId
        );
        return {
          id: conv.id,
          type: conv.type,
          name: otherParticipant?.user.fullName || "Unknown",
          avatar: otherParticipant?.user.avatarUrl,
          lastMessage: conv.messages[0]?.content || "",
          time: conv.messages[0]?.createdAt
            ? new Date(conv.messages[0].createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread:
            conv.participants.find((p) => p.userId === userId)?.unreadCount ||
            0,
          role: otherParticipant?.user.role || "STUDENT",
        };
      });

      socket.emit("conversations_loaded", formattedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      socket.emit("error", { message: "Failed to load conversations" });
    }
  });

  // Load conversation messages
  socket.on(
    "load_messages",
    async (data: { conversationId: string; page?: number; limit?: number }) => {
      if (!isAuthenticated || !userId) {
        return socket.emit("error", { message: "Authentication required" });
      }

      try {
        const { conversationId, page = 1, limit = 50 } = data;

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
          where: { conversationId, userId, },
        });

        if (!participant) {
          return socket.emit("error", {
            message: "Not authorized to access this conversation",
          });
        }

        const messages = await prisma.message.findMany({
          where: { conversationId, isDeleted: false },
          include: {
            sender: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        });

        const formattedMessages = messages.map((msg) => ({
          id: msg.id,
          sender: msg.sender.fullName || "Unknown",
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: msg.senderId === userId,
          type: msg.type,
          isRead: msg.isRead,
          isEdited: msg.isEdited,
        }));

        socket.emit("messages_loaded", {
          conversationId,
          messages: formattedMessages,
          hasMore: messages.length === limit,
        });
      } catch (error) {
        console.error("Error loading messages:", error);
        socket.emit("error", { message: "Failed to load messages" });
      }
    }
  );

  // Join conversation room
  socket.on("join_conversation", async (conversationId: string) => {
    if (!isAuthenticated || !userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    try {
      // Verify user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });

      if (participant) {
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

  // Send message
  socket.on("send_message", async (data: MessageData) => {
    if (!isAuthenticated || !userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    try {
      const { conversationId, content, type = "TEXT" } = data;

      // Verify user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });

      if (!participant) {
        return socket.emit("error", {
          message: "Not authorized to send messages to this conversation",
        });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          type,
          isRead: false,
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      // Update conversation
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
          userId: { not: userId },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });

      // Emit to conversation room
      io.to(conversationId).emit("new_message", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        sender: message.sender,
      });

      console.log(
        `Message sent in conversation ${conversationId} by user ${userId}`
      );
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Mark messages as read
  socket.on("mark_read", async (conversationId: string) => {
    if (!isAuthenticated || !userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    try {
      // Reset unread count
      await prisma.conversationParticipant.updateMany({
        where: { conversationId, userId },
        data: { unreadCount: 0 },
      });

      // Mark messages as read
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

      console.log(
        `Messages marked as read for user ${userId} in conversation ${conversationId}`
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Leave conversation
  socket.on("leave_conversation", (conversationId: string) => {
    if (!isAuthenticated || !userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    socket.leave(conversationId);
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(port, hostname, () => {
  console.log(`🚀 Socket server running on http://${hostname}:${port}`);
  console.log(
    `📡 Accepting connections from: ${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }`
  );
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down socket server gracefully...");
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log("Socket server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
