import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewCoach,
  reviewProgram,
  getCoachReviews,
  getProgramReviews,
} from "@/actions/reviews";
import { handleAndToastError } from "@/lib/error-handler";

export const COACH_REVIEWS_QUERY_KEY = "coach-reviews";
export const PROGRAM_REVIEWS_QUERY_KEY = "program-reviews";

export function useCoachReviews({
  coachId,
  page = 1,
  limit = 10,
  sortBy = "recent",
}: {
  coachId: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
}) {
  return useQuery({
    queryKey: [COACH_REVIEWS_QUERY_KEY, coachId, page, limit, sortBy],
    queryFn: () => getCoachReviews({ coachId, page, limit, sortBy }),
    enabled: !!coachId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useProgramReviews({
  programSlug,
  page = 1,
  limit = 10,
  sortBy = "recent",
}: {
  programSlug: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
}) {
  return useQuery({
    queryKey: [PROGRAM_REVIEWS_QUERY_KEY, programSlug, page, limit, sortBy],
    queryFn: () => getProgramReviews({ programSlug, page, limit, sortBy }),
    enabled: !!programSlug,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useReviewCoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewCoach,
    onSuccess: (_, variables) => {
      // Invalidate coach reviews
      queryClient.invalidateQueries({
        queryKey: [COACH_REVIEWS_QUERY_KEY, variables.coachId],
      });
      // Also invalidate coach data to update rating
      queryClient.invalidateQueries({
        queryKey: ["coach-by-slug"],
      });
      queryClient.invalidateQueries({
        queryKey: ["coach-by-id", variables.coachId],
      });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to submit review.");
    },
  });
}

export function useReviewProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewProgram,
    onSuccess: () => {
      // Invalidate program reviews
      queryClient.invalidateQueries({
        queryKey: [PROGRAM_REVIEWS_QUERY_KEY],
      });
      // Also invalidate program data to update rating
      queryClient.invalidateQueries({
        queryKey: ["program-by-slug"],
      });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to submit review.");
    },
  });
}
