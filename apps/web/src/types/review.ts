import { ApiResponse } from "./api";

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  isVerified: boolean;
  reviewer: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export type ReviewsResponse = ApiResponse<{
  reviews: Review[];
  targetEntity?: {
    id: string;
    title?: string | null;
    name?: string | null;
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
