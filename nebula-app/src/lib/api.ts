import { ApiResponse } from "@/types";

export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: HeadersInit;
  body?: any;
  baseURL?: string;
}

export async function makeRequest<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    baseURL = process.env.API_URL || "http://localhost:3001",
  } = config;

  const url = `${baseURL}/api${endpoint}`;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET") {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const request = await fetch(url, requestConfig);

    // Handle 401 with token refresh retry
    if (request.status === 401) {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    const response: ApiResponse<T> = await request.json();

    if (!request.ok) {
      const error = new Error(response.message || "Request failed");
      Object.assign(error, {
        status: request.status,
        code: response.code,
      });
      throw error;
    }

    return response;
  } catch (error) {
    console.log({ error });
    if (error instanceof Error && "status" in error) {
      throw error;
    }

    throw new Error(error instanceof Error ? error.message : "Network error");
  }
}
