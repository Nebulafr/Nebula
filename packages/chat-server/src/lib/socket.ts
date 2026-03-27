import type { Server } from "socket.io";
import type { SocketData } from "../types";

export const getSocketServer = (): Server<any, any, any, SocketData> => {
  if (!global.socketServer) {
    throw new Error("Socket server not initialized");
  }
  return global.socketServer.io;
};

export const isSocketServerInitialized = (): boolean => {
  return !!global.socketServer;
};
