"use client";

import { io } from "socket.io-client";

const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

// Create socket connection with authentication
export const createAuthenticatedSocket = (token: string) => {
  return io(NEXT_PUBLIC_WS_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};

// Default socket instance (will need to be reconnected with auth)
export const socket = io(NEXT_PUBLIC_WS_URL, {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false, // Don't connect automatically without auth
});
