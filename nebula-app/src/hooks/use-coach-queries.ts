import { useQuery } from "@tanstack/react-query";
import { getCoachById } from "@/actions/coaches";

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