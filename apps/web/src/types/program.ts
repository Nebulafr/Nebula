import { ApiResponse } from "./api";
import { Coach, CoachExperience } from "./coach";
import { Cohort } from "./cohort";
import { Category } from "./category";
import { ProgramStatus } from "@/enums";
export { ProgramStatus };

export interface EnrolledProgramMaterial {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  position: number;
}

export interface ModuleFormData {
  title: string;
  description?: string;
  week: number;
}

export interface Program {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  objectives: string[];
  coachId: string;
  slug: string;
  price: number;
  duration?: string | null;
  difficultyLevel: string;
  maxStudents: number;
  currentEnrollments: number;
  isActive: boolean;
  status: string;
  rating: number;
  totalReviews: number;
  tags: string[];
  prerequisites: string[];
  targetAudience: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type AdminProgram = Program & {
  coach: {
    id: string;
    user: {
      fullName?: string;
      avatarUrl?: string;
    };
  };
  category: Category;
};

export interface DashboardProgram {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  price: number;
  duration: string | null;
  difficultyLevel: string;
  maxStudents: number;
  currentEnrollments: number;
  isActive: boolean;
  status: string;
  rating: number;
  totalReviews: number;
  tags: string[];
  prerequisites: string[];
  category: {
    name: string;
    slug: string;
  } | null;
  modules: any[]; // Using any for now to avoid database dependency in portable types
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ProgramReviewWithUser = {
  id: string;
  content: string;
  rating: number;
  createdAt: string | Date;
  user?: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
};

export type ProgramWithRelations = Program & {
  category: Category;
  coach: {
    id: string;
    title?: string;
    bio?: string;
    style?: string;
    specialties?: string[];
    pastCompanies?: string[];
    rating?: number;
    user: {
      email: string;
      id: string;
      fullName?: string;
      avatarUrl?: string;
    };
  };
  modules: {
    id: string;
    title: string;
    week: number;
    description?: string;
    materials?: EnrolledProgramMaterial[];
  }[];
  reviews: Array<{
    id: string;
    content: string;
    rating: number;
    reviewer: {
      id: string;
      fullName?: string;
    };
  }>;
  enrollments: Array<{
    student: {
      id: string;
    };
  }>;
  attendees?: string[];
  _count: {
    enrollments: number;
    reviews: number;
  };
  hasUserReviewed: boolean;
  cohorts?: Cohort[];
  coCoaches?: Array<{
    id: string;
    coach: {
      user: {
        id: string;
        fullName?: string | null;
        avatarUrl?: string | null;
      }
    }
  }>;
};

export type ProgramResponse = ApiResponse<{
  program: ProgramWithRelations;
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

export type GroupedProgramsResponse = ApiResponse<{
  groupedPrograms: {
    group: string;
    items: ProgramWithRelations[];
  }[];
}>;

export type AdminProgramsResponse = ApiResponse<{
  programs: AdminProgram[];
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}>;

export interface ProgramActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
