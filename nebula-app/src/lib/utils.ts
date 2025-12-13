import { ApiResponse } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getAccessToken } from "./auth-storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const protectedRoutes = {
  "/dashboard": "student",
  "/coach-dashboard": "coach",
  "/admin": "admin",
  "/onboarding": "student",
  "/coach-onboarding": "coach",
};

export const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/coach-login",
  "/coach-signup",
  "/forgot-password",
  "/coaches",
  "/programs",
  "/about",
  "/help-center",
  "/events",
  "/become-a-coach",
];

export async function makeRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  options: {
    body?: any;
    headers?: Record<string, string>;
    requireAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { body, headers = {}, requireAuth = true } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
        message: "Please log in to continue",
      };
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  };

  if (body && method !== "GET" && method !== "DELETE") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`/api${endpoint}`, config);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
      }
      return {
        success: false,
        error: "Session expired",
        message: "Your session has expired. Please log in again.",
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || `HTTP ${response.status}`,
        message: result.message || "Request failed",
        code: result.code,
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "Success",
      code: result.code,
    };
  } catch (error: any) {
    console.error(`API request failed [${method} /api${endpoint}]:`, error);

    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to connect to server",
    };
  }
}

export const apiGet = <T = any>(endpoint: string, options?: any) =>
  makeRequest<T>(endpoint, "GET", options);

export const apiPost = <T = any>(endpoint: string, body?: any, options?: any) =>
  makeRequest<T>(endpoint, "POST", { body, ...options });

export const apiPut = <T = any>(endpoint: string, body?: any, options?: any) =>
  makeRequest<T>(endpoint, "PUT", { body, ...options });

export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  options?: any
) => makeRequest<T>(endpoint, "PATCH", { body, ...options });

export const apiDelete = <T = any>(endpoint: string, options?: any) =>
  makeRequest<T>(endpoint, "DELETE", options);

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
