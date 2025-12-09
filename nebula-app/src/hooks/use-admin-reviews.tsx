"use client";

import { useState, useCallback } from "react";
import { apiGet } from "@/lib/utils";

export interface AdminReview {
  id: string;
  reviewerId: string;
  revieweeId?: string;
  programId?: string;
  coachId?: string;
  targetType: "PROGRAM" | "COACH" | "SESSION";
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
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  reviewee?: {
    id: string;
    fullName: string;
    email: string;
  };
  program?: {
    id: string;
    title: string;
  };
}

interface UseAdminReviewsParams {
  search?: string;
  targetType?: string;
  status?: string;
  rating?: string;
}

interface UseAdminReviewsReturn {
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  fetchReviews: (params?: UseAdminReviewsParams) => Promise<void>;
  refetch: () => void;
}

export function useAdminReviews(): UseAdminReviewsReturn {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<UseAdminReviewsParams>({});

  const fetchReviews = useCallback(async (params: UseAdminReviewsParams = {}) => {
    setLoading(true);
    setError(null);
    setLastParams(params);

    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.targetType) queryParams.append("targetType", params.targetType);
      if (params.status) queryParams.append("status", params.status);
      if (params.rating) queryParams.append("rating", params.rating);

      const url = `/admin/reviews${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiGet(url);
      
      if (response.success) {
        setReviews(response.data.reviews || []);
      } else {
        setError(response.message || "Failed to fetch reviews");
        setReviews([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchReviews(lastParams);
  }, [fetchReviews, lastParams]);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    refetch,
  };
}