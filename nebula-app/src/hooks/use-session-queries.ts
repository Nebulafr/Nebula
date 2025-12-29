import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/utils";

export function useCoachSessions(filter: "today" | "upcoming" | "past" | "all" = "upcoming") {
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

export function useStudentSessions(filter: "today" | "upcoming" | "past" | "all" = "upcoming") {
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
    mutationFn: async ({ coachId, date, time, duration = 60 }: BookSessionData) => {
      return apiPost(`/coaches/${coachId}/book`, {
        date: date.toISOString(),
        startTime: time,
        duration,
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch session-related queries
      queryClient.invalidateQueries({ queryKey: ["student-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
      
      return data;
    },
    onError: (error) => {
      console.error("Session booking failed:", error);
    },
  });
}