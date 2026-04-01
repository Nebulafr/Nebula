import { ApiResponse } from "./api";

export interface Coach {
  id: string;
  userId: string;
  title: string;
  bio: string;
  style: string;
  pastCompanies: string[];
  linkedinUrl?: string | null;
  availability: string;
  hourlyRate: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string | null;
  qualifications: string[];
  timezone?: string | null;
  languages: string[];
  googleCalendarAccessToken?: string | null;
  googleCalendarRefreshToken?: string | null;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  createdAt: string;
  updatedAt: string;
  // UI helper fields (often mapped from user)
  fullName: string;
  avatarUrl?: string | null;
}

export interface CoachExperience {
  id: string;
  coachId: string;
  role: string;
  company: string;
  startDate: string | Date;
  endDate: string | Date | null;
  description: string | null;
}

export type CoachWithUser = Coach & {
  user: {
    fullName?: string | null;
    avatarUrl?: string | null;
    email: string;
  }
};

export type CoachWithRelations = Coach & {
  user?: {
    fullName?: string | null;
    avatarUrl?: string | null;
    email?: string;
  };
  specialties: Array<{ id: string; name: string }>;
  experiences: CoachExperience[];
};

export interface CoachStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  program: string;
  lastSession?: string | null;
  enrollmentDate?: string;
  status?: string;
  progress?: number;
}


export type CoachesResponse = ApiResponse<{
  coaches: CoachWithRelations[];
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}>;

export type CoachDetailResponse = ApiResponse<{
  coach: CoachWithRelations;
}>;
