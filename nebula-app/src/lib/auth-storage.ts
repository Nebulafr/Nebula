import Cookies from "universal-cookie";

// Utility functions for managing authentication tokens with cookies
export const AUTH_TOKEN_KEY = "accessToken";
export const USER_DATA_KEY = "userData";

const cookies = new Cookies();

const cookieOptions = {
  httpOnly: false, // Needs to be false for client-side access
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

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

// Store auth data after successful authentication
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

export function clearAuthData(): void {
  cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  cookies.remove(USER_DATA_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("pendingGoogleSignInRole");
  }
}
