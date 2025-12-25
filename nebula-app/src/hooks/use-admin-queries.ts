import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "@/lib/utils";

export const ADMIN_REVIEWS_QUERY_KEY = "admin-reviews";
export const ADMIN_USERS_QUERY_KEY = "admin-users";

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

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "COACH" | "STUDENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function useAdminReviews(params?: {
  search?: string;
  targetType?: string;
  status?: string;
  rating?: string;
}) {
  return useQuery({
    queryKey: [ADMIN_REVIEWS_QUERY_KEY, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.targetType) queryParams.append("targetType", params.targetType);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.rating) queryParams.append("rating", params.rating);

      const url = `/admin/reviews${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch reviews");
      }
      
      return response.data.reviews || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role) queryParams.append("role", params.role);
      if (params?.status) queryParams.append("status", params.status);

      const url = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch users");
      }
      
      return response.data.users || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      role: string;
      password: string;
    }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.name,
          role: userData.role.toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create user");
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch admin users
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
}