import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoaches,
  getCoachBySlug,
  getCoachById,
  createCoach,
  updateCoachProfile,
} from "@/actions/coaches";
import { CoachUpdateData, CreateCoachData } from "@/lib/validations";

export const COACHES_QUERY_KEY = "coaches";
export const COACH_BY_SLUG_QUERY_KEY = "coach-by-slug";
export const COACH_BY_ID_QUERY_KEY = "coach-by-id";

export function useCoaches(filters?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [COACHES_QUERY_KEY, filters],
    queryFn: () => getCoaches(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useCoachBySlug(slug: string) {
  return useQuery({
    queryKey: [COACH_BY_SLUG_QUERY_KEY, slug],
    queryFn: () => getCoachBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCoachById(coachId: string) {
  return useQuery({
    queryKey: [COACH_BY_ID_QUERY_KEY, coachId],
    queryFn: () => getCoachById(coachId),
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coachData: CreateCoachData) => createCoach(coachData),
    onSuccess: () => {
      // Invalidate coaches list
      queryClient.invalidateQueries({ queryKey: [COACHES_QUERY_KEY] });
      // Also invalidate user profile since coach profile was created
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useUpdateCoachProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coachData: CoachUpdateData) => updateCoachProfile(coachData),
    onSuccess: () => {
      // Invalidate all coach-related queries
      queryClient.invalidateQueries({ queryKey: [COACHES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_BY_SLUG_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_BY_ID_QUERY_KEY] });
      // Also invalidate user profile since coach profile was updated
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}