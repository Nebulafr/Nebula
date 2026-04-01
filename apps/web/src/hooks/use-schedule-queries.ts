import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/utils";
import { CoachSessionsResponse, CoachDashboardStats, CoachAvailabilityResponse, CoachAvailability } from "@/types";
import { handleAndToastError } from "@/lib/utils";

export const COACH_SESSIONS_QUERY_KEY = "coach-sessions";
export const COACH_AVAILABILITY_QUERY_KEY = "coach-availability";

export function useCoachSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return useQuery<CoachSessionsResponse["data"]>({
    queryKey: [COACH_SESSIONS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await apiGet<CoachSessionsResponse["data"]>(
        `/coaches/sessions?filter=${filter}`
      );
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch sessions");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCoachStats() {
  return useQuery<CoachDashboardStats>({
    queryKey: ["coach-stats"],
    queryFn: async () => {
      const response = await apiGet<CoachDashboardStats>("/coaches/stats");
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch coach stats");
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCoachAvailability() {
  return useQuery<CoachAvailabilityResponse["data"]>({
    queryKey: [COACH_AVAILABILITY_QUERY_KEY],
    queryFn: async () => {
      const response = await apiGet<CoachAvailabilityResponse["data"]>(
        "/coaches/availability"
      );
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch availability");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveCoachAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: CoachAvailability) => {
      return apiPost("/coaches/availability", { availability });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COACH_AVAILABILITY_QUERY_KEY],
      });
    },
    onError: (error) => {
      handleAndToastError(error, "Failed to update availability");
    },
  });
}
