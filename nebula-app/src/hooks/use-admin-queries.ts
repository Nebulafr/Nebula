import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "@/lib/utils";
import { handleAndToastError } from "@/lib/error-handler";

export const ADMIN_REVIEWS_QUERY_KEY = "admin-reviews";
export const ADMIN_USERS_QUERY_KEY = "admin-users";
export const ADMIN_DASHBOARD_STATS_QUERY_KEY = "admin-dashboard-stats";
export const ADMIN_RECENT_SIGNUPS_QUERY_KEY = "admin-recent-signups";
export const ADMIN_PLATFORM_ACTIVITY_QUERY_KEY = "admin-platform-activity";
export const ADMIN_EVENTS_QUERY_KEY = "admin-events";

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
  coach?: {
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useAdminReviews(params?: {
  search?: string;
  targetType?: string;
  status?: string;
  rating?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [ADMIN_REVIEWS_QUERY_KEY, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.targetType)
        queryParams.append("targetType", params.targetType);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.rating) queryParams.append("rating", params.rating);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const url = `/admin/reviews${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch reviews");
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role) queryParams.append("role", params.role);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.page) queryParams.append("page", params.page.toString());

      const url = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch users");
      }

      return response.data;
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
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
     
    onError: (error: any) => {
      handleAndToastError(error, "Failed to create user.");
    },
  });
}

export interface DashboardStats {
  revenue: { value: string; change: string };
  users: { value: string; change: string };
  signups: { value: string; change: string };
  coaches: { value: string; change: string };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [ADMIN_DASHBOARD_STATS_QUERY_KEY],
    queryFn: async () => {
      const response = await makeRequest("/admin/dashboard/stats", "GET");

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch dashboard stats");
      }

      return response.data.stats as DashboardStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface RecentSignup {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joined?: string;
}

export function useRecentSignups(limit: number = 5) {
  return useQuery({
    queryKey: [ADMIN_RECENT_SIGNUPS_QUERY_KEY, limit],
    queryFn: async () => {
      const url = `/admin/dashboard/recent-signups?limit=${limit}`;
      const response = await makeRequest(url, "GET");

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recent signups");
      }

      return response.data.signups as RecentSignup[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export interface PlatformActivity {
  type: string;
  description: string;
  time: string;
}

export function usePlatformActivity(limit: number = 10) {
  return useQuery({
    queryKey: [ADMIN_PLATFORM_ACTIVITY_QUERY_KEY, limit],
    queryFn: async () => {
      const url = `/admin/dashboard/activity?limit=${limit}`;
      const response = await makeRequest(url, "GET");

      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch platform activity",
        );
      }

      return response.data.activities as PlatformActivity[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  date: string;
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
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  _count?: {
    attendees: number;
  };
}

export function useAdminEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [ADMIN_EVENTS_QUERY_KEY, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.eventType) queryParams.append("eventType", params.eventType);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const url = `/admin/events${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch events");
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await makeRequest(`/admin/reviews/${reviewId}`, "DELETE");

      if (!response.success) {
        throw new Error(response.message || "Failed to delete review");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_REVIEWS_QUERY_KEY] });
    },
     
    onError: (error: any) => {
      handleAndToastError(error, "Failed to delete review.");
    },
  });
}
