import { apiGet, apiPost } from "@/lib/utils";
import { ReviewsResponse } from "@/types";

export async function reviewCoach({
  coachId,
  rating,
  content,
  title,
  sessionId,
}: {
  coachId: string;
  rating: number;
  content: string;
  title?: string;
  sessionId?: string;
}) {
  const reviewData = {
    rating,
    title,
    content: content.trim(),
    sessionId: sessionId || undefined,
  };

  return apiPost(`/coaches/${coachId}/review`, reviewData, { throwOnError: true });
}

export async function reviewProgram({
  programId,
  rating,
  content,
  title,
}: {
  programId: string;
  rating: number;
  content: string;
  title?: string;
}) {
  const reviewData = {
    rating,
    title,
    content: content.trim(),
  };

  return apiPost(`/programs/id/${programId}/review`, reviewData, { throwOnError: true });
}

export async function getCoachReviews({
  coachId,
  page = 1,
  limit = 10,
  sortBy = "recent",
}: {
  coachId: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
}): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  return apiGet<ReviewsResponse["data"]>(`/coaches/${coachId}/reviews?${params}`, {
    requireAuth: false,
  }) as Promise<ReviewsResponse>;
}

export async function getProgramReviews({
  programSlug,
  page = 1,
  limit = 10,
  sortBy = "recent",
}: {
  programSlug: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
}): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  return apiGet<ReviewsResponse["data"]>(`/programs/slug/${programSlug}/reviews?${params}`, {
    requireAuth: false,
  }) as Promise<ReviewsResponse>;
}
