import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoaches,
  getCoachBySlug,
  getCoachById,
  createCoach,
  updateCoachProfile,
  getSuggestedCoaches,
} from "@/actions/coaches";
import { CoachesResponse, CoachDetailResponse } from "@/types/coach";
import { CoachUpdateData, CreateCoachData } from "@/lib/validations";
import { handleAndToastError } from "@/lib/error-handler";

export const COACHES_QUERY_KEY = "coaches";
export const COACH_BY_SLUG_QUERY_KEY = "coach-by-slug";
export const COACH_BY_ID_QUERY_KEY = "coach-by-id";
export const SUGGESTED_COACHES_QUERY_KEY = "suggested-coaches";

export function useCoaches(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  company?: string;
  school?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery<CoachesResponse["data"]>({
    queryKey: [COACHES_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await getCoaches(filters);
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch coaches");
    },
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
      queryClient.invalidateQueries({ queryKey: [COACHES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },

    onError: (error: any) => {
      handleAndToastError(error, "Failed to create coach profile.");
    },
  });
}

export function useUpdateCoachProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coachData: CoachUpdateData) => updateCoachProfile(coachData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACHES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_BY_SLUG_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COACH_BY_ID_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },

    onError: (error: any) => {
      handleAndToastError(error, "Failed to update profile.");
    },
  });
}

export function useSuggestedCoaches(limit?: number) {
  return useQuery<CoachesResponse["data"]>({
    queryKey: [SUGGESTED_COACHES_QUERY_KEY, limit],
    queryFn: async () => {
      const response = await getSuggestedCoaches(limit);
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch suggested coaches");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
