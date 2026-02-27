import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoachSessions,
  getCoachStats,
  createCoachSession,
  updateCoachSession,
  cancelCoachSession,
  rescheduleCoachSession,
  approveCoachSession,
  rejectCoachSession,
  getCoachAvailability,
  saveCoachAvailability,
  DayAvailability,
} from "@/actions/session";
import { CoachSessionsResponse, CoachStatsResponse, CoachAvailabilityResponse } from "@/types/coach";
import { handleAndToastError } from "@/lib/error-handler";

export const COACH_SESSIONS_QUERY_KEY = "coach-sessions";
export const COACH_STATS_QUERY_KEY = "coach-stats";
export const COACH_AVAILABILITY_QUERY_KEY = "coach-availability";

// Sessions queries
export function useCoachSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return useQuery<CoachSessionsResponse["data"]>({
    queryKey: [COACH_SESSIONS_QUERY_KEY, filter],
    queryFn: async () => {
      const response = await getCoachSessions(filter);
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch sessions");
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCoachStats() {
  return useQuery<CoachStatsResponse["data"]>({
    queryKey: [COACH_STATS_QUERY_KEY],
    queryFn: async () => {
      const response = await getCoachStats();
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch coach stats");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Session mutations
export function useCreateCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      scheduledTime: string;
      duration?: number;
      studentIds?: string[];
      meetLink?: string;
    }) => createCoachSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_STATS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to create session.");
    },
  });
}

export function useUpdateCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: {
        title?: string;
        description?: string;
        scheduledTime?: string;
        duration?: number;
        status?: string;
        meetLink?: string;
        notes?: string;
      };
    }) => updateCoachSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to update session.");
    },
  });
}

export function useCancelCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      reason,
    }: {
      sessionId: string;
      reason?: string;
    }) => cancelCoachSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_STATS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to cancel session.");
    },
  });
}

export function useRescheduleCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: {
        date: string;
        startTime: string;
        timezone?: string;
      };
    }) => rescheduleCoachSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to reschedule session.");
    },
  });
}

// Availability queries
export function useCoachAvailability() {
  return useQuery<CoachAvailabilityResponse["data"]>({
    queryKey: [COACH_AVAILABILITY_QUERY_KEY],
    queryFn: async () => {
      const response = await getCoachAvailability();
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch availability");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Availability mutations
export function useSaveCoachAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availability: Record<string, DayAvailability>) =>
      saveCoachAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COACH_AVAILABILITY_QUERY_KEY],
      });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to update availability.");
    },
  });
}

export function useApproveCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => approveCoachSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_STATS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to approve session.");
    },
  });
}

export function useRejectCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => rejectCoachSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_STATS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      handleAndToastError(error, "Failed to reject session.");
    },
  });
}
