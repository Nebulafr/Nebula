"use client";

import { io } from "socket.io-client";

const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:9001";

export const createAuthenticatedSocket = (token: string) => {
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
