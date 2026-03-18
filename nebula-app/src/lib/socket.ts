"use client";

import { io } from "socket.io-client";
import { publicEnv } from "@/config/env";

const NEXT_PUBLIC_WS_URL = publicEnv.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

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
