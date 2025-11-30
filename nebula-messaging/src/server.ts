import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { User } from "./generated/prisma";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

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
