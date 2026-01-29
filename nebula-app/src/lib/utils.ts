import { ApiResponse } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { v4 as uuidv4 } from "uuid";
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
    throwOnError?: boolean;
  } = {},
): Promise<ApiResponse<T>> {
  const {
    body,
    headers = {},
    requireAuth = true,
    throwOnError = false,
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (!token) {
      const errorResponse = {
        success: false,
        error: "Authentication required",
        message: "Please log in to continue",
      };
      if (throwOnError) throw new Error(errorResponse.message);
      return errorResponse;
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

    if (response.status === 401 && requireAuth) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
      }
      const errorResponse = {
        success: false,
        error: "Session expired",
        message: "Your session has expired. Please log in again.",
      };
      if (throwOnError) throw new Error(errorResponse.message);
      return errorResponse;
    }

    const result = await response.json();

    if (!response.ok) {
      const errorResponse = {
        success: false,
        error: result.error || result.message || `HTTP ${response.status}`,
        message: result.message || "Request failed",
        code: result.code,
      };
      if (throwOnError) throw new Error(errorResponse.message);
      return errorResponse;
    }

    if (result.success === false) {
      const errorResponse = {
        success: false,
        error: result.error || result.message || "Request failed",
        message: result.message || "Request failed",
        code: result.code,
      };
      if (throwOnError) throw new Error(errorResponse.message);
      return errorResponse;
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "Success",
      code: result.code,
    };
  } catch (error: any) {
    console.error(`API request failed [${method} /api${endpoint}]:`, error);

    const errorResponse = {
      success: false,
      error: "Network error",
      message: error.message || "Failed to connect to server",
    };
    if (throwOnError) throw error;
    return errorResponse;
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
  options?: any,
) => makeRequest<T>(endpoint, "PATCH", { body, ...options });

export const apiDelete = <T = any>(endpoint: string, options?: any) =>
  makeRequest<T>(endpoint, "DELETE", options);

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const generateSlug = (text: string): string => {
  const id = uuidv4().split("-")[0];
  const slug =
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + id;
  return slug;
};

// Date utilities
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday being 0
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function truncateText(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
