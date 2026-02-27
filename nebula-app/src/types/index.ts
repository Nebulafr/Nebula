export interface ModuleFormData {
  title: string;
  week: number;
  description: string;
}

export interface CourseFormData {
  modules: ModuleFormData[];
}

export enum RESPONSE_CODE {
  INVALID_FIELDS,
  USER_NOT_FOUND,
  USER_ALREADY_EXIST,
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  INVALID_PARAMS,
  METHOD_NOT_ALLOWED,
  ORDER_EXISTS,
  UNAUTHORIZED,
  FORBIDDEN,
  SUCCESS,
  INVALID_TOKEN,
  ERROR,
  EMAIL_FAILED_TO_SEND,
  BAD_REQUEST,
  NOT_FOUND,
}

// lib/api-response.ts
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

// Helper function to create consistent responses
export function createSuccessResponse<T>(
  data?: T,
  message: string = "Success"
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(
  error: string,
  message?: string,
  code?: string
): ApiResponse {
  return {
    success: false,
    error,
    message: message || error,
    code,
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export type CategoriesResponse = ApiResponse<{
  categories: Category[];
}>;

// Program Response Types
import { ProgramWithRelations } from "./program";
export type { ProgramWithRelations };

export type GroupedProgramsResponse = ApiResponse<{
  groupedPrograms: {
    group: string;
    items: ProgramWithRelations[];
  }[];
}>;

export type ProgramsResponse = ApiResponse<{
  programs: ProgramWithRelations[];
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}>;

export type ProgramResponse = ApiResponse<{
  program: ProgramWithRelations;
}>;

// Enrollment Types
export interface Enrollment {
  id: string;
  programId: string;
  studentId: string;
  status: string;
  createdAt: string;
}

export interface EnrollmentWithRelations extends Enrollment {
  progress: number;
  enrollmentDate: string;
  completionDate?: string;
  program: ProgramWithRelations;
  coach: {
    id: string;
    fullName?: string;
    name?: string;
    avatarUrl?: string;
    user?: {
      fullName?: string;
      avatarUrl?: string;
    };
  };
}

export type EnrollmentsResponse = ApiResponse<{
  enrollments: EnrollmentWithRelations[];
}>;

// Review Types
export interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  reviewer?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface StudentSession {
  id: string;
  title: string | null;
  description: string | null;
  scheduledTime: string;
  duration: number;
  status: string;
  meetLink: string | null;
  coach: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export type StudentSessionsResponse = ApiResponse<{
  sessions: StudentSession[];
}>;

export type ReviewsResponse = ApiResponse<{
  reviews: Review[];
  targetEntity?: {
    id: string;
    title?: string;
    name?: string;
    rating?: number;
    totalReviews?: number;
  };
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}>;

export type CheckoutResponse = ApiResponse<{
  url: string;
}>;

export * from "./cohort";

import { NextRequest } from "next/server";
import { UserRole, Coach, Student, User } from "@/generated/prisma";

export type AuthState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATED_NO_PROFILE"
  | "AUTHENTICATED_WITH_PROFILE";

export interface UserProfile extends User {
  coach: (Coach & { specialties: string[] }) | null;
  student: Student | null;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface AuthenticatedRequest extends NextRequest {
  user: UserProfile;
}
