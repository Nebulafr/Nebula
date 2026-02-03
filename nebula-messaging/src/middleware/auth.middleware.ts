import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { AuthenticatedSocket, JwtPayload } from "../types";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";

const validateJwtToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

const getTokenFromSocket = (socket: AuthenticatedSocket): string | null => {
  return (socket.handshake.auth.token as string) || null;
};

const isValidUser = (user: any): boolean => {
  return user && user.status === "ACTIVE";
};

const fetchUserById = async (userId: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true, status: true },
    });
  } catch (dbError) {
    console.error(
      "Database connection error during socket auth:",
      dbError instanceof Error ? dbError.message : String(dbError)
    );
    console.error("DATABASE_URL is configured:", !!process.env.DATABASE_URL);
    return null;
  }
};

const validateToken = async (token: string) => {
  const decoded = validateJwtToken(token);
  if (!decoded) return null;

  const user = await fetchUserById(decoded.userId);

  if (!isValidUser(user)) {
    console.log(
      "Invalid user or inactive account - marking as unauthenticated"
    );
    return null;
  }

  return user;
};

const initializeSocketData = (
  socket: AuthenticatedSocket,
  user: any = null
): void => {
  socket.data = socket.data || {};
  socket.data.isAuthenticated = !!user;
  if (user) {
    socket.data.userId = user.id;
    socket.data.user = user;
  }
};

export const createAuthMiddleware = () => {
  return async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        console.log(
          "Socket connection without auth token - allowing but marking as unauthenticated"
        );
        initializeSocketData(socket);
        return next();
      }

      const user = await validateToken(token);
      initializeSocketData(socket, user);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      initializeSocketData(socket);
      next();
    }
  };
};

export const isAuthenticated = (socket: AuthenticatedSocket): boolean => {
  return socket && socket.data && socket.data.isAuthenticated && !!socket.data.userId;
};

export const getUserId = (socket: AuthenticatedSocket): string | null => {
  return isAuthenticated(socket) ? socket.data?.userId! : null;
};

export const requireAuth = (
  callback: (socket: AuthenticatedSocket, ...args: any[]) => Promise<void>
) => {
  return async (socket: AuthenticatedSocket, ...args: any[]) => {
    if (!socket || !isAuthenticated(socket)) {
      if (socket) {
        return socket.emit("error", { message: "Authentication required" });
      }
      return;
    }
    return callback(socket, ...args);
  };
};
