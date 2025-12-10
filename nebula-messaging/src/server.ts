import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import * as ConversationHandler from ".//handlers/conversation.handler";
import * as MessageHandler from ".//handlers/message.handler";
import type {
  AuthenticatedSocket,
  ServerConfig,
  GlobalSocketServer,
} from "./types";

dotenv.config();

const createServerConfig = (): ServerConfig => ({
  port: parseInt(process.env.PORT || "9001"),
  hostname: "0.0.0.0",
  corsOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    "https://*.vercel.app",
    /https:\/\/.*\.vercel\.app$/,
  ],
});

const createCorsConfig = (origins: (string | RegExp)[]) => ({
  origin: origins,
  methods: ["GET", "POST"],
  credentials: true,
});

const createHttpServer = () => createServer();

const createSocketServer = (httpServer: any, corsConfig: any) => {
  return new Server(httpServer, {
    cors: corsConfig,
    transports: ["websocket", "polling"],
  });
};

const logConnection = (
  socketId: string,
  userId: string | undefined,
  isAuthenticated: boolean
) => {
  console.log(
    `Client connected: ${socketId} User: ${
      userId || "undefined"
    } Authenticated: ${isAuthenticated}`
  );
};

const logDisconnection = (socketId: string) => {
  console.log("Client disconnected:", socketId);
};

const registerEventHandlers = (socket: AuthenticatedSocket, io: Server) => {
  socket.on("load_conversations", () =>
    ConversationHandler.loadConversations(socket)
  );
  socket.on("join_conversation", (conversationId: string) =>
    ConversationHandler.joinConversation(socket, conversationId)
  );
  socket.on("leave_conversation", (conversationId: string) =>
    ConversationHandler.leaveConversation(socket, conversationId)
  );
  socket.on("mark_read", (conversationId: string) =>
    ConversationHandler.markAsRead(socket, conversationId)
  );

  socket.on("load_messages", (data: any) =>
    MessageHandler.loadMessages(socket, data)
  );
  socket.on("send_message", (data: any) =>
    MessageHandler.sendMessage(io)(socket, data)
  );
  socket.on("mark_read", (conversationId: string) =>
    MessageHandler.markRead(socket, conversationId)
  );
  socket.on("delete_message", (messageId: string) =>
    MessageHandler.deleteMessage(socket, messageId)
  );
  socket.on("edit_message", (data: any) =>
    MessageHandler.editMessage(socket, data)
  );

  socket.on("disconnect", () => logDisconnection(socket.id));
};

const handleConnection = (io: Server) => (socket: AuthenticatedSocket) => {
  const { userId, isAuthenticated } = socket.data;

  logConnection(socket.id, userId, isAuthenticated);
  registerEventHandlers(socket, io);
};

const logServerStart = (hostname: string, port: number) => {
  console.log(`🚀 Socket server running on http://${hostname}:${port}`);
  console.log(
    `📡 Accepting connections from: ${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }`
  );
};

const startServer = (httpServer: any, hostname: string, port: number) => {
  httpServer.listen(port, hostname, () => logServerStart(hostname, port));
};

const createShutdownHandler = (httpServer: any) => () => {
  console.log("Shutting down socket server gracefully...");
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log("Socket server closed");
    process.exit(0);
  });
};

const registerShutdownHandlers = (shutdownHandler: () => void) => {
  process.on("SIGTERM", shutdownHandler);
  process.on("SIGINT", shutdownHandler);
};

const setGlobalSocketServer = (io: Server) => {
  global.socketServer = { io };
};

const initializeServer = () => {
  const config = createServerConfig();
  const httpServer = createHttpServer();
  const corsConfig = createCorsConfig(config.corsOrigins);
  const io = createSocketServer(httpServer, corsConfig);

  setGlobalSocketServer(io);

  io.use(createAuthMiddleware());

  io.on("connection", handleConnection(io));

  startServer(httpServer, config.hostname, config.port);

  const shutdownHandler = createShutdownHandler(httpServer);
  registerShutdownHandlers(shutdownHandler);

  return { httpServer, io };
};

initializeServer();
