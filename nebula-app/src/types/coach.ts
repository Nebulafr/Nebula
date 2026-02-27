import { SessionStatus } from "@/generated/prisma";
import { ApiResponse } from "./index";

export interface CoachProgram {
  id: string;
  title: string;
  category: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  currentEnrollments: number;
  createdAt: string;
}

export interface CoachReview {
  id: string;
  reviewerId: string;
  revieweeId?: string;
  targetId: string;
  targetType: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  reviewee: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
}

export interface CoachDashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeStudents: number;
  studentsChange: number;
  sessionsThisMonth: number;
  sessionsChange: number;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
}

export type CoachStatsResponse = ApiResponse<CoachDashboardStats>;

export interface DashboardSession {
  id: string;
  title: string | null;
  description: string | null;
  scheduledTime: string;
  duration: number;
  status: SessionStatus;
  meetLink: string | null;
  students: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type CoachSessionsResponse = ApiResponse<{
  sessions: DashboardSession[];
}>;

export interface CoachWithRelations {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string;
  category: string;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  hasUserReviewed: boolean;
  programs: {
    id: string;
    title: string;
    category: string;
    slug: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    currentEnrollments: number;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    reviewerId: string;
    revieweeId?: string;
    targetId: string;
    targetType: string;
    rating: number;
    title?: string;
    content: string;
    isVerified: boolean;
    isPublic: boolean;
    helpfulCount?: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    reviewer: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    } | null;
    reviewee: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    } | null;
  }[];
}

export interface ApiCoach {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string;
  category: string;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CoachesResponse {
  success: boolean;
  data?: {
    coaches: ApiCoach[];
    pagination?: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  };
  error?: string;
  message?: string;
}

export interface CoachDetailResponse {
  success: boolean;
  data?: {
    coach: CoachWithRelations;
  };
  error?: string;
  message?: string;
}

export interface CreateCoachResponse {
  success: boolean;
  data?: {
    coach: ApiCoach;
  };
  error?: string;
  message?: string;
}

export interface UpdateCoachResponse {
  success: boolean;
  data?: {
    coach: ApiCoach;
  };
  error?: string;
  message?: string;
}
export interface CoachAvailability {
  monday: { enabled: boolean; startTime: string; endTime: string };
  tuesday: { enabled: boolean; startTime: string; endTime: string };
  wednesday: { enabled: boolean; startTime: string; endTime: string };
  thursday: { enabled: boolean; startTime: string; endTime: string };
  friday: { enabled: boolean; startTime: string; endTime: string };
  saturday: { enabled: boolean; startTime: string; endTime: string };
  sunday: { enabled: boolean; startTime: string; endTime: string };
}

export type CoachAvailabilityResponse = ApiResponse<{
  availability: CoachAvailability;
}>;

export interface CoachStudent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  program: string;
  status: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  lastSession: string | null;
  joinedDate: string;
}

export type CoachStudentsResponse = ApiResponse<{
  students: CoachStudent[];
}>;
