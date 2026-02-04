import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/utils";
import { handleAndToastError } from "@/lib/error-handler";

export function useCoachSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return useQuery({
    queryKey: ["coach-sessions", filter],
    queryFn: () => apiGet(`/coaches/sessions?filter=${filter}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCoachStats() {
  return useQuery({
    queryKey: ["coach-stats"],
    queryFn: () => apiGet("/coaches/stats"),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useStudentSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return useQuery({
    queryKey: ["student-sessions", filter],
    queryFn: () => apiGet(`/students/sessions?filter=${filter}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, will be filtered client-side
  });
}

interface BookSessionData {
  coachId: string;
  date: Date;
  time: string;
  duration?: number;
}

export function useBookCoachSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      date,
      time,
      duration = 60,
    }: BookSessionData) => {
      return apiPost(`/coaches/${coachId}/book`, {
        date: date.toISOString(),
        startTime: time,
        duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch session-related queries
      queryClient.invalidateQueries({ queryKey: ["student-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });

      return data;
    },
    onError: (error) => {
      handleAndToastError(error, "Failed to book session");
    },
  });
}
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      reason,
    }: {
      sessionId: string;
      reason?: string;
    }) => {
      return apiPost(`/sessions/${sessionId}/cancel`, { reason });
    },
    onSuccess: (data) => {
      // Invalidate and refetch session-related queries
      queryClient.invalidateQueries({ queryKey: ["student-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["coach-stats"] });

      return data;
    },
    onError: (error) => {
      handleAndToastError(error, "Failed to cancel session");
    },
  });
}

export function useRescheduleSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      date,
      startTime,
    }: {
      sessionId: string;
      date: string;
      startTime: string;
    }) => {
      return apiPost(`/sessions/${sessionId}/reschedule`, {
        date,
        startTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch session-related queries
      queryClient.invalidateQueries({ queryKey: ["student-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });

      return data;
    },
    onError: (error) => {
      handleAndToastError(error, "Failed to reschedule session");
    },
  });
}
