import Cookies from "universal-cookie";
import { env } from "@/config/env";
import jwt from "jsonwebtoken";

/* --- Constants --- */
export const AUTH_TOKEN_KEY = "accessToken";
export const USER_DATA_KEY = "userData";
export const GOOGLE_ACCESS_TOKEN_KEY = "googleAccessToken";
export const GOOGLE_REFRESH_TOKEN_KEY = "googleRefreshToken";

const cookies = new Cookies();

const cookieOptions = {
  httpOnly: false, // Must be accessible by client-side auth-storage
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

/* --- Storage Utilities (Shared/Client) --- */

export function storeAccessToken(token: string): void {
  cookies.set(AUTH_TOKEN_KEY, token, cookieOptions);
}

export function getAccessToken(): string | null {
  return cookies.get(AUTH_TOKEN_KEY) || null;
}

export function removeAccessToken(): void {
  cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("pendingGoogleSignInRole");
  }
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

export function storeAuthData(authResponse: {
  accessToken: string;
  user: any;
}): void {
  storeAccessToken(authResponse.accessToken);
  cookies.set(USER_DATA_KEY, JSON.stringify(authResponse.user), cookieOptions);
}

export function getStoredUserData(): any | null {
  const userData = cookies.get(USER_DATA_KEY);
  return userData
    ? typeof userData === "string"
      ? JSON.parse(userData)
      : userData
    : null;
}

export function storeGoogleAccessToken(token: string): void {
  cookies.set(GOOGLE_ACCESS_TOKEN_KEY, token, cookieOptions);
}

export function getGoogleAccessToken(): string | null {
  return cookies.get(GOOGLE_ACCESS_TOKEN_KEY) || null;
}

export function storeGoogleRefreshToken(token: string): void {
  cookies.set(GOOGLE_REFRESH_TOKEN_KEY, token, cookieOptions);
}

export function getGoogleRefreshToken(): string | null {
  return cookies.get(GOOGLE_REFRESH_TOKEN_KEY) || null;
}

export function removeGoogleAccessToken(): void {
  cookies.remove(GOOGLE_ACCESS_TOKEN_KEY, { path: "/" });
}

export function removeGoogleRefreshToken(): void {
  cookies.remove(GOOGLE_REFRESH_TOKEN_KEY, { path: "/" });
}

export function clearAuthData(): void {
  cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  cookies.remove(USER_DATA_KEY, { path: "/" });
  cookies.remove(GOOGLE_ACCESS_TOKEN_KEY, { path: "/" });
  cookies.remove(GOOGLE_REFRESH_TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("pendingGoogleSignInRole");
  }
}

/* --- JWT Utilities (Server-side) --- */

const ACCESS_SECRET = env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = env.REFRESH_TOKEN_SECRET!;

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ACCESS_SECRET);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET);
