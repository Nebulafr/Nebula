import { ApiResponse } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { v4 as uuidv4 } from "uuid";
import { twMerge } from "tailwind-merge";
import { getAccessToken } from "./auth";
import React from 'react';
import { Book, Presentation, StickyNote, File, Video } from "lucide-react";
import { toast } from "react-toastify";

/* --- UI Styling --- */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* --- Routing --- */

export const protectedRoutes = {
  "/dashboard": "student",
  "/coach-dashboard": "coach",
  "/admin": "admin",
  "/onboarding": "student",
  "/coach-onboarding": "coach",
};

export const publicRoutes = [
  "/", "/login", "/signup", "/coach-login", "/coach-signup",
  "/forgot-password", "/coaches", "/programs", "/about",
  "/help-center", "/events", "/become-a-coach", "/reset-password",
  "/verify-email", "/universities", "/privacy-policy",
  "/terms-of-service", "/careers", "/nebula-ai"
];

/* --- API Request Helpers --- */

interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  throwOnError?: boolean;
  timeout?: number;
}

export class ApiError<T = any> extends Error {
  public response: ApiResponse<T>;
  public status: number;

  constructor(response: ApiResponse<T>, status: number) {
    super(response.message || response.error || "API Request failed");
    this.name = "ApiError";
    this.response = response;
    this.status = status;
  }
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
    timeout = 30000,
  } = options;

  const isFormData = body instanceof FormData;
  const requestHeaders: Record<string, string> = { ...headers };

  if (!isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (requireAuth) {
    const token = getAccessToken();
    if (!token) {
      const err = { success: false, error: "Authentication required", message: "Please log in to continue" };
      if (throwOnError) throw new ApiError(err, 401);
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
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`/api${endpoint}`, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
    }

    let result: any;
    try {
      result = await response.json();
    } catch {
      try {
        const text = await response.text();
        result = { 
          success: response.ok, 
          message: text?.length < 200 ? text : (response.statusText || "Request failed") 
        };
      } catch {
        result = { success: response.ok, message: response.statusText || "Request failed" };
      }
    }

    if (!response.ok || result.success === false) {
      const errorMsg = result.message || result.error || "Request failed";
      const errorResponse = {
        success: false,
        error: result.error || errorMsg,
        message: errorMsg,
        code: result.code || `HTTP_${response.status}`,
      };
      if (throwOnError) throw new ApiError(errorResponse, response.status);
      return errorResponse;
    }

    return {
      success: true,
      data: result.data as T,
      message: result.message || "Success",
      code: result.code,
    };
  } catch (error: unknown) {
    if (throwOnError) throw error;
    const err = error instanceof Error ? error : new Error(String(error));
    let errorMessage = "Failed to connect to server";
    let errorType = "Network error";

    if (err.name === "AbortError") {
      errorMessage = "Request timed out. Please try again.";
      errorType = "Timeout";
    } else if (err.message === "Failed to fetch") {
      errorMessage = "Unable to reach the server. Please check your connection.";
      errorType = "Connection error";
    } else if (err.message) {
      errorMessage = err.message;
    }

    console.error(`API Error [${method} ${endpoint}]:`, errorType, err);
    return { success: false, error: errorType, message: errorMessage };
  }
}

export const apiGet = <T = unknown>(endpoint: string, options?: RequestOptions) => makeRequest<T>(endpoint, "GET", options);
export const apiPost = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) => makeRequest<T>(endpoint, "POST", { ...options, body });
export const apiPut = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) => makeRequest<T>(endpoint, "PUT", { ...options, body });
export const apiPatch = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) => makeRequest<T>(endpoint, "PATCH", { ...options, body });
export const apiDelete = <T = unknown>(endpoint: string, options?: RequestOptions) => makeRequest<T>(endpoint, "DELETE", options);

/* --- String Manipulation --- */

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const formatUserName = (name: string | null | undefined): string => {
  if (!name || name.trim().length === 0) return "Unknown User";
  return name.trim().split(" ").map(capitalize).join(" ");
};

export const formatUserRole = (role: string | null | undefined): string => {
  if (!role || role.trim().length === 0) return "User";
  const roleMap: Record<string, string> = {
    COACH: "Coach", STUDENT: "Student", ADMIN: "Administrator",
    SUPPORT: "Support", MENTOR: "Mentor", TUTOR: "Tutor",
    INSTRUCTOR: "Instructor", TEACHER: "Teacher",
  };
  return roleMap[role.toUpperCase()] || formatUserName(role);
};

export const generateSlug = (text: string): string => {
  const id = uuidv4().split("-")[0];
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") + id;
};

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  const cleanText = text.trim().replace(/\s+/g, " ");
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength - 3).trim() + "...";
}

/* --- Date Utilities --- */

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatTime = (date: Date): string => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
export const formatDate = (date: Date): string => date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export function formatChatTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return formatTime(dateObj);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return dateObj.toLocaleDateString([], { weekday: "short" });
    if (dateObj.getFullYear() === now.getFullYear()) return dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    return dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

/* --- Avatar / Image Utilities --- */

export const avatarColorPairs = [
  { from: "#4F46E5", to: "#7C3AED" }, // Indigo to Violet
  { from: "#EC4899", to: "#8B5CF6" }, // Pink to Violet
  { from: "#3B82F6", to: "#06B6D4" }, // Blue to Cyan
  { from: "#10B981", to: "#3B82F6" }, // Emerald to Blue
  { from: "#F59E0B", to: "#EF4444" }, // Amber to Red
  { from: "#8B5CF6", to: "#D946EF" }, // Violet to Fuchsia
  { from: "#0EA5E9", to: "#2563EB" }, // Sky to Blue
  { from: "#F43F5E" , to: "#FB923C" }, // Rose to Orange
];

export function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColorPairs[Math.abs(hash) % avatarColorPairs.length];
}

export function getInitials(name?: string | null): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getUserAvatar(name?: string | null, size: number = 128): string | undefined {
  return undefined;
}

/* --- Chat Specific Utilities --- */

export interface ChatHeaderInfo {
  displayName: string;
  displayRole: string;
  initials: string;
  lastSeen?: string;
}

export function formatChatHeader(conversation: any): ChatHeaderInfo {
  return {
    displayName: formatUserName(conversation.name),
    displayRole: formatUserRole(conversation.role),
    initials: getInitials(conversation.name),
    lastSeen: conversation.time ? formatChatTime(conversation.time) : undefined,
  };
}

export function formatUnreadCount(count: number | null | undefined): string {
  if (!count || count <= 0) return "";
  return count > 99 ? "99+" : count.toString();
}

export function formatMessagePreview(message: string | null | undefined, maxLength: number = 15): string {
  if (!message || message.trim().length === 0) return "No messages yet";
  const cleanMessage = message.trim().replace(/\s+/g, " ");
  if (cleanMessage.length <= maxLength) return cleanMessage;
  return cleanMessage.substring(0, maxLength - 3) + "...";
}

export function getMessageInputPlaceholder(userRole: string, recipientRole: string): string {
  const recipientName = formatUserRole(recipientRole).toLowerCase();
  return `Type a message to your ${recipientName}...`;
}

/* --- Event Backgrounds & Assets --- */

export const backgroundColors = ["bg-yellow-50", "bg-blue-50", "bg-purple-50"];
export const gradientBackgrounds = [
  "bg-gradient-to-br from-blue-100 to-blue-200", "bg-gradient-to-br from-purple-100 to-purple-200",
  "bg-gradient-to-br from-pink-100 to-pink-200", "bg-gradient-to-br from-green-100 to-green-200",
  "bg-gradient-to-br from-yellow-100 to-yellow-200", "bg-gradient-to-br from-indigo-100 to-indigo-200",
  "bg-gradient-to-br from-orange-100 to-orange-200", "bg-gradient-to-br from-teal-100 to-teal-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200", "bg-gradient-to-br from-emerald-100 to-emerald-200",
];

export function getEventBackgroundColor(index: number, prevIdx?: number): string {
  let idx = index % backgroundColors.length;
  if (prevIdx !== undefined && idx === prevIdx % backgroundColors.length) idx = (idx + 1) % backgroundColors.length;
  return backgroundColors[idx];
}

export function getEventGradientBackground(index: number, prevIdx?: number): string {
  let idx = index % gradientBackgrounds.length;
  if (prevIdx !== undefined && idx === prevIdx % gradientBackgrounds.length) idx = (idx + 1) % gradientBackgrounds.length;
  return gradientBackgrounds[idx];
}

export function getEventBackgroundColors(count: number): string[] {
  const colors: string[] = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    let idx = i % backgroundColors.length;
    if (idx === last) idx = (idx + 1) % backgroundColors.length;
    colors.push(backgroundColors[idx]);
    last = idx;
  }
  return colors;
}

export function getEventGradientBackgrounds(count: number): string[] {
  const gradients: string[] = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    let idx = i % gradientBackgrounds.length;
    if (idx === last) idx = (idx + 1) % gradientBackgrounds.length;
    gradients.push(gradientBackgrounds[idx]);
    last = idx;
  }
  return gradients;
}

export const getDefaultAvatar = (name?: string) => undefined;

export function getDefaultCategoryImage(name?: string): string {
  const seed = name ? name.replace(/\s/g, "").toLowerCase() : "default";
  return `https://picsum.photos/400/400?random=${seed}`;
}

export function getDefaultBanner(index: number, prevSeed?: number): string {
  let seed = (index % 1000) + 1;
  if (prevSeed !== undefined && seed === prevSeed) seed = (seed % 1000) + 1;
  return `https://picsum.photos/800/400?random=${seed}`;
}

export function getDefaultBanners(count: number): string[] {
  const banners: string[] = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    let seed = (i % 1000) + 1;
    if (seed === last) seed = ((i + 1) % 1000) + 1;
    banners.push(`https://picsum.photos/800/400?random=${seed}`);
    last = seed;
  }
  return banners;
}

export const getAccessTypeText = (type?: string) => type?.toLowerCase() === "free" ? "Free" : "Premium";

/* --- Material Normalization & Icons --- */

export interface Material {
  fileName?: string;
  name?: string;
  url?: string;
  link?: string;
  fileType?: string;
  type?: string;
  fileSize?: number;
}

export function normalizeMaterial(mat: string | Material) {
  const isString = typeof mat === "string";
  const name = isString ? mat.split("/").pop()! : (mat.fileName || mat.name || "document");
  const link = isString ? mat : (mat.url || mat.link || "#");
  let type = isString ? (mat.endsWith(".pdf") ? "pdf" : "doc") : (mat.fileType || mat.type || "");

  // Normalize type
  const typeLower = type.toLowerCase();
  if (typeLower.includes("pdf")) type = "pdf";
  else if (typeLower.includes("video")) type = "video";
  else if (typeLower.includes("word") || typeLower.includes("officedocument") || typeLower.includes("doc")) type = "doc";
  else if (typeLower.includes("presentation") || typeLower.includes("powerpoint") || typeLower.includes("ppt")) type = "ppt";
  else type = "file";

  const sizeDisplay = !isString && mat.fileSize ?
    (mat.fileSize > 1024 * 1024 ? `${(mat.fileSize / (1024 * 1024)).toFixed(2)} MB` : `${(mat.fileSize / 1024).toFixed(2)} KB`)
    : null;

  return { name, link, type, sizeDisplay };
}

export const getMaterialIcon = (type: string, size: number = 5) => {
  const className = `h-${size} w-${size}`;
  switch (type) {
    case "pdf":
      return React.createElement(Book, { className: `${className} text-red-500` });
    case "ppt":
      return React.createElement(Presentation, { className: `${className} text-orange-500` });
    case "doc":
      return React.createElement(StickyNote, { className: `${className} text-blue-500` });
    case "video":
      return React.createElement(Video, { className: `${className} text-blue-500` });
    default:
      return React.createElement(File, { className: `${className} text-muted-foreground` });
  }
};

/* --- Error Handling --- */

export function handleAndToastError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;

  if (error instanceof ApiError) {
    errorMessage = error.response.message || error.response.error || error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = (error as { message: string }).message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error("Error caught:", error);
  toast.error(errorMessage);
}
