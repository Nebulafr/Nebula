import { apiGet, apiPost } from "@/lib/utils";

export async function reviewCoach({
  coachSlug,
  rating,
  content,
  sessionId,
}: {
  coachSlug: string;
  rating: number;
  content: string;
  sessionId?: string;
}) {
  try {
    const reviewData = {
      rating,
      content: content.trim(),
      sessionId: sessionId || null,
    };

    const response = await apiPost(`/coaches/${coachSlug}/review`, reviewData);

    if (!response.success) {
      throw new Error(
        response.error || response.message || "Failed to submit review"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Review submitted successfully",
    };
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error: error.message || "Failed to submit review",
    };
  }
}

export async function getCoachReviews({
  coachSlug,
  page = 1,
  limit = 10,
  sortBy = "recent",
}: {
  coachSlug: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("page", page.toString());
    searchParams.set("limit", limit.toString());
    searchParams.set("sortBy", sortBy);

    const query = searchParams.toString() ? `?${searchParams}` : "";
    const response = await apiGet(`/coaches/${coachSlug}/reviews${query}`, {
      requireAuth: false,
    });

    if (!response.success) {
      throw new Error(
        response.error || response.message || "Failed to fetch reviews"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Reviews fetched successfully",
    };
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch reviews",
      data: {
        reviews: [],
        coach: null,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalReviews: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 10,
        },
      },
    };
  }
}
