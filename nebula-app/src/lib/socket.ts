"use client";

import { io } from "socket.io-client";

const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

console.log("Socket connecting to:", NEXT_PUBLIC_WS_URL);

// Create socket connection with authentication
export const createAuthenticatedSocket = (token: string) => {
  console.log("Creating authenticated socket with token:", token ? "✓" : "✗");
  return io(NEXT_PUBLIC_WS_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"], // Add polling as fallback
    auth: {
      token,
    },
    timeout: 10000,
    forceNew: true,
  });
};

// Default socket instance (will need to be reconnected with auth)
export const socket = io(NEXT_PUBLIC_WS_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"], // Add polling as fallback
  autoConnect: false, // Don't connect automatically without auth
});
