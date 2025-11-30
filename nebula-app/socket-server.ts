import { createServer } from "node:http";
import { Server } from "socket.io";
import { SocketService } from "./src/app/api/services/socket.service";
import "dotenv/config";

const port = parseInt(process.env.SOCKET_PORT || "9001");
const hostname = "localhost";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:9002",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const socketService = new SocketService(io);
socketService.setupSocketEvents();

global.socketService = socketService;

httpServer
  .once("error", (err) => {
    console.error("Socket server error:", err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`🚀 Socket server ready on http://${hostname}:${port}`);
    console.log(
      `📡 Accepting connections from: ${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }`
    );
  });

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down socket server gracefully");
  httpServer.close(() => {
    console.log("Socket server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down socket server gracefully");
  httpServer.close(() => {
    console.log("Socket server closed");
    process.exit(0);
  });
});
