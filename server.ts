import { createServer } from "node:http";
import next from "next";
const { parse } = require("node:url");
import { Server } from "socket.io";
import { SocketService } from "./src/app/api/services/socket.service";
import "dotenv/config";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000");
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handler(req, res, parsedUrl);
  });

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
      console.error("Next.js server error:", err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`🌐 Next.js app ready on http://${hostname}:${port}`);
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
});
