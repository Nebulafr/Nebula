import { ApiResponse } from "./api";
import { User, UserRole, UserStatus } from "./user";
import { ProgramStatus } from "./program";

export interface AdminDashboardStats {
  revenue: {
    value: string;
    change: string;
  };
  users: {
    value: string;
    change: string;
  };
  activeStudents: {
    value: string;
    change: string;
  };
  coaches: {
    value: string;
    change: string;
  };
}

export interface AdminDashboardStatsResponse extends ApiResponse<AdminDashboardStats> {}

export interface AdminUser extends User {
  coach?: {
    id: string;
  } | null;
}

export interface AdminUsersResponse extends ApiResponse<{
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}

export interface AdminReview {
  id: string;
  rating: number;
  content: string;
  targetType: "COACH" | "PROGRAM";
  createdAt: string | Date;
  reviewer: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  target: any; // Can be Program or Coach
}

export interface AdminReviewsResponse extends ApiResponse<{
  reviews: AdminReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}

export interface AdminTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  sourceType: string;
  sourceId: string;
  description?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface AdminTransactionsResponse extends ApiResponse<{
  transactions: AdminTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}
export interface RecentSignup {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joined?: string;
}

export interface PlatformActivity {
  type: string;
  description: string;
  time: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  date: string | Date;
  location?: string;
  images: string[];
  slug: string;
  organizerId: string;
  isPublic: boolean;
  maxAttendees?: number;
  status?: string;
  tags: string[];
  meetLink?: string;
  googleEventId?: string;
  whatToBring?: string;
  additionalInfo?: string;
  lumaEventLink: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  organizer?: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  _count?: {
    attendees: number;
  };
}

export interface AdminEventsResponse extends ApiResponse<{
  events: AdminEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}
