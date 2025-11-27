import { ApiResponse } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

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

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("User not authenticated");
  }

  return accessToken;
}

async function makeRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  options: {
    body?: any;
    headers?: Record<string, string>;
    requireAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { body, headers = {}, requireAuth = true } = options;

  try {
    let requestHeaders: Record<string, any> = {
      "Content-Type": "application/json",
    };

    if (headers && typeof headers === "object") {
      requestHeaders = { ...requestHeaders, ...headers };
    }

    if (requireAuth) {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      requestHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${token}`,
      };
    }

    const config: AxiosRequestConfig = {
      method,
      url: `/api${endpoint}`,
      headers: requestHeaders,
      withCredentials: true,
      timeout: 30000,
    };

    if (method !== "GET" && method !== "DELETE" && body) {
      config.data = body;
    }

    const response = await axios(config);

    const responseData = response.data;

    return {
      success: responseData.success !== false,
      data: responseData.data || responseData,
      message: responseData.message,
      error: responseData.error,
    } as ApiResponse<T>;
  } catch (error: any) {
    console.error(`API request failed [${method} /api${endpoint}]:`, error);

    if (error instanceof AxiosError) {
      if (!error.response) {
        throw new Error("Network error. Please check your connection.");
      }

      // Handle 401 Unauthorized - clear auth data
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }

      // Server error with response
      const responseData = error.response.data;
      throw new Error(
        responseData?.error ||
          responseData?.message ||
          `HTTP ${error.response.status}`
      );
    }

    throw new Error(error.message || "An unexpected error occurred");
  }
}

export async function apiGet<T = any>(
  endpoint: string,
  options?: { headers?: Record<string, string>; requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, "GET", options);
}

export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  options?: { headers?: Record<string, string>; requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, "POST", { body, ...options });
}

export async function apiPut<T = any>(
  endpoint: string,
  body: any,
  options?: { headers?: Record<string, string>; requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, "PUT", { body, ...options });
}

export async function apiPatch<T = any>(
  endpoint: string,
  body: any,
  options?: { headers?: Record<string, string>; requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, "PATCH", { body, ...options });
}

export async function apiDelete<T = any>(
  endpoint: string,
  options?: { headers?: Record<string, string>; requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, "DELETE", options);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    headers?: Record<string, string>;
    requireAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers, requireAuth } = options;
  return makeRequest<T>(endpoint, method, { body, headers, requireAuth });
}
