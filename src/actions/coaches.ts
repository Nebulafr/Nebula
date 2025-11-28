import { Coach } from "@/generated/prisma";
import { apiGet, apiPut } from "@/lib/utils";

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
  // Exact Prisma Review model fields
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
  // Related data
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

export interface CoachGroup {
  group: string;
  items: ApiCoach[];
}

interface ApiCoach {
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
    groupedCoaches: CoachGroup[];
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

export async function getCoaches(filters?: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<CoachesResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.category && filters.category !== "All") {
      params.append("category", filters.category);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const url = `/coaches${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiGet(url);
    return {
      success: response.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching coaches:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch coaches",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function getCoachBySlug(
  slug: string
): Promise<CoachDetailResponse> {
  try {
    const url = `/coaches/${slug}`;
    const response = await apiGet(url, { requireAuth: false });

    return {
      success: response.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching coach by slug:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch coach",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function getCoachById(
  coachId: string
): Promise<CoachDetailResponse> {
  try {
    const url = `/coaches/${coachId}`;
    const response = await apiGet(url, { requireAuth: false });

    return {
      success: response.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching coach by ID:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch coach",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export interface CreateCoachData {
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
}

export interface UpdateCoachData {
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies?: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  qualifications?: string[];
  experience?: string;
  timezone?: string;
  languages?: string[];
}

export interface CreateCoachResponse {
  success: boolean;
  data?: {
    coach: any;
  };
  error?: string;
  message?: string;
}

export interface UpdateCoachResponse {
  success: boolean;
  data?: {
    coach: any;
  };
  error?: string;
  message?: string;
}

export async function createCoach(
  coachData: CreateCoachData
): Promise<CreateCoachResponse> {
  try {
    const response = await apiPut("/coaches/profile", coachData);

    if (!response.success) {
      throw new Error(response.message || "Failed to create coach profile");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error creating coach profile:", error);
    return {
      success: false,
      error: error.message || "Failed to create coach profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateCoachProfile(
  coachData: UpdateCoachData
): Promise<UpdateCoachResponse> {
  try {
    const response = await apiPut("/coaches/profile", coachData);

    if (!response.success) {
      throw new Error(response.message || "Failed to update coach profile");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating coach profile:", error);
    return {
      success: false,
      error: error.message || "Failed to update coach profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}
