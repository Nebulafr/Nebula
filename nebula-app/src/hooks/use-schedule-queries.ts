import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoachSessions,
  getCoachStats,
  createCoachSession,
  updateCoachSession,
  cancelCoachSession,
  getCoachAvailability,
  saveCoachAvailability,
  DayAvailability,
} from "@/actions/session";
import { toast } from "react-toastify";
import { handleAndToastError } from "@/lib/error-handler";

export const COACH_SESSIONS_QUERY_KEY = "coach-sessions";
export const COACH_STATS_QUERY_KEY = "coach-stats";
export const COACH_AVAILABILITY_QUERY_KEY = "coach-availability";

// Sessions queries
export function useCoachSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return useQuery({
    queryKey: [COACH_SESSIONS_QUERY_KEY, filter],
    queryFn: () => getCoachSessions(filter),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCoachStats() {
  return useQuery({
    queryKey: [COACH_STATS_QUERY_KEY],
    queryFn: () => getCoachStats(),
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
      toast.success("Session created successfully!");
    },
    onError: (error: any) => {
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
      toast.success("Session updated successfully!");
    },
    onError: (error: any) => {
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
      toast.success("Session cancelled successfully.");
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to cancel session.");
    },
  });
}

// Availability queries
export function useCoachAvailability() {
  return useQuery({
    queryKey: [COACH_AVAILABILITY_QUERY_KEY],
    queryFn: () => getCoachAvailability(),
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
      toast.success("Availability updated successfully!");
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to update availability.");
    },
  });
}
