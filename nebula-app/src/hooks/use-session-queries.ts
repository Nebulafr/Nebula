import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/utils";

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
  });
}