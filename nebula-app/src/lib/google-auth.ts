import { google } from "googleapis";
import { env } from "@/config/env";

// Simple in-memory token storage (in production, use Redis or database)
const tokenStore = new Map<string, { accessToken: string; refreshToken?: string; expiryDate?: number }>();

export function storeGoogleTokens(userId: string, accessToken: string, refreshToken?: string, expiryDate?: number) {
  tokenStore.set(userId, { accessToken, refreshToken, expiryDate });
}

export function getGoogleTokens(userId: string) {
  return tokenStore.get(userId);
}

export function clearGoogleTokens(userId: string) {
  tokenStore.delete(userId);
}

export function getGoogleAuthUrl() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google credentials");
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ],
    prompt: "consent"
  });
}