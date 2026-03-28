import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import { prisma } from "./lib/prisma";
import { env } from "./config/env";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import * as ConversationHandler from "./handlers/conversation.handler";
import * as MessageHandler from "./handlers/message.handler";
import type { AuthenticatedSocket } from "./types";

const registerEventHandlers = (socket: AuthenticatedSocket, io: Server) => {
  // Conversations
  socket.on("load_conversations", () => ConversationHandler.loadConversations(socket));
  socket.on("join_conversation", (id) => ConversationHandler.joinConversation(socket, id));
  socket.on("leave_conversation", (id) => ConversationHandler.leaveConversation(socket, id));

  // Messages
  socket.on("load_messages", (data) => MessageHandler.loadMessages(socket, data));
  socket.on("send_message", (data) => MessageHandler.sendMessage(io)(socket, data));
  socket.on("mark_read", (id) => MessageHandler.markRead(socket, id));
  socket.on("delete_message", (id) => MessageHandler.deleteMessage(socket, id));
  socket.on("edit_message", (data) => MessageHandler.editMessage(socket, data));

  // Typing
  socket.on("typing_start", (id) => MessageHandler.typingStart(io)(socket, id));
  socket.on("typing_stop", (id) => MessageHandler.typingStop(io)(socket, id));

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
};

const initializeServer = () => {
  const app = express();

  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      service: "Nebula Messaging",
      timestamp: new Date().toISOString(),
    });
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: [env.NEXT_PUBLIC_APP_URL, "http://localhost:3000", /https:\/\/.*\.vercel\.app$/],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  global.socketServer = { io };

  io.use(createAuthMiddleware());

  io.on("connection", (socket: AuthenticatedSocket) => {
    const { userId, isAuthenticated } = socket.data;
    console.log(`Client connected: ${socket.id} (User: ${userId || "Guest"}, Auth: ${isAuthenticated})`);
    registerEventHandlers(socket, io);
  });

  httpServer.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Socket server running on http://0.0.0.0:${env.PORT}`);
    console.log(`📡 Accepting connections from: ${env.NEXT_PUBLIC_APP_URL}`);
  });

  const shutdown = () => {
    console.log("Shutting down gracefully...");
    httpServer.close(async () => {
      await prisma.$disconnect();
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return { httpServer, io };
};

initializeServer();
