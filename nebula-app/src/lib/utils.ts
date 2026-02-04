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
  "/reset-password",
  "/verify-email",
  "/universities",
  "/privacy-policy",
  "/terms-of-service",
  "/careers",
  "/nebula-ai",
  "/help-center",
];

interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  throwOnError?: boolean;
}

export async function makeRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  options: RequestOptions = {},
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
      const err = {
        success: false,
        error: "Authentication required",
        message: "Please log in to continue",
      };
      if (throwOnError) throw new Error(err.message);
      return err;
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  };

  if (body && !["GET", "DELETE"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`/api${endpoint}`, config);

    // Auto-clear invalid tokens
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
      }
    }

    let result: any;
    try {
      result = await response.json();
    } catch {
      result = { success: response.ok };
    }

    if (!response.ok || result.success === false) {
      const errorMsg = result.message || result.error || "Request failed";
      const errorResponse = {
        success: false,
        error: result.error || errorMsg,
        message: errorMsg,
        code: result.code || `HTTP_${response.status}`,
      };

      if (throwOnError) throw new Error(errorResponse.message);
      return errorResponse;
    }

    return {
      success: true,
      data: result.data as T,
      message: result.message || "Success",
      code: result.code,
    };
  } catch (error: any) {
    if (throwOnError) throw error;

    console.error(`API Error [${method} ${endpoint}]:`, error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to connect to server",
    };
  }
}

export const apiGet = <T = any>(endpoint: string, options?: RequestOptions) =>
  makeRequest<T>(endpoint, "GET", options);

export const apiPost = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions,
) => makeRequest<T>(endpoint, "POST", { ...options, body });

export const apiPut = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions,
) => makeRequest<T>(endpoint, "PUT", { ...options, body });

export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions,
) => makeRequest<T>(endpoint, "PATCH", { ...options, body });

export const apiDelete = <T = any>(
  endpoint: string,
  options?: RequestOptions,
) => makeRequest<T>(endpoint, "DELETE", options);

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
