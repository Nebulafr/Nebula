import { Program } from "@/generated/prisma";

export type AdminProgram = Program & {
  coach: {
    id: string;
    user: {
      fullName?: string;
      avatarUrl?: string;
    };
  };
  category: {
    id: string;
    name: string;
  };
};

export interface AdminProgramsResponse {
  success: boolean;
  data?: {
    programs: AdminProgram[];
  };
  error?: string;
  message?: string;
}

export interface ProgramActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type ProgramWithRelations = Program & {
  category: {
    id: string;
    name: string;
  };
  coach: {
    id: string;
    title?: string;
    bio?: string;
    style?: string;
    specialties?: string[];
    pastCompanies?: string[];
    rating?: number;
    user: {
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
    materials?: string[];
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
  schedules?: Array<{
    id: string;
    startDate: Date;
    endDate?: Date;
  }>;
};
