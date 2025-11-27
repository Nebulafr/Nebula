// Utility functions for managing authentication tokens

export const AUTH_TOKEN_KEY = "accessToken";

export function storeAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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

  // You could also store user data in localStorage if needed
  if (typeof window !== "undefined") {
    localStorage.setItem("userData", JSON.stringify(authResponse.user));
  }
}

export function getStoredUserData(): any | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}

export function clearAuthData(): void {
  removeAccessToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem("userData");
  }
}
