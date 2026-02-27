import { useQuery } from "@tanstack/react-query";
import { getCoachById } from "@/actions/coaches";
import { getCoachStudents } from "@/actions/session";
import { CoachStudent } from "@/types/coach";

export function useCoachById(coachId: string) {
  return useQuery({
    queryKey: ["coach", coachId],
    queryFn: async () => {
      const response = await getCoachById(coachId);

      if (response.success && response.data?.coach) {
        return response.data.coach;
      }

      throw new Error(response.error || "Failed to fetch coach");
    },
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}


export function useCoachStudents() {
  return useQuery({
    queryKey: ["coach", "students"],
    queryFn: async () => {
      const response = await getCoachStudents();

      if (response.success && response.data?.students) {
        return response.data.students as CoachStudent[];
      }

      throw new Error(response.error || "Failed to fetch students");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}