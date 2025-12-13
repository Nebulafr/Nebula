"use client";

import { io } from "socket.io-client";

const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export const createAuthenticatedSocket = (token: string) => {
  console.log("Creating authenticated socket with token:", token ? "✓" : "✗");
  return io(NEXT_PUBLIC_WS_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: {
      token,
    },
    timeout: 10000,
    forceNew: true,
  });
};
