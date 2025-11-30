import { apiGet, apiPost } from "@/lib/utils";

export interface ReviewResponse {
  success: boolean;
  data?: { reviewId: string };
  error?: string;
  message?: string;
}

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
}): Promise<ReviewResponse> {
  try {
    const reviewData = {
      rating,
      title,
      content: content.trim(),
      sessionId: sessionId || undefined,
    };

    const response = await apiPost(`/coaches/${coachId}/review`, reviewData);

    if (!response.success) {
      throw new Error(
        response.message || "Failed to submit review"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Review submitted successfully",
    };
  } catch (error: any) {
    console.error("Error submitting coach review:", error);
    return {
      success: false,
      error: error.message || "Failed to submit review",
    };
  }
}

export async function reviewProgram({
  programSlug,
  rating,
  content,
  title,
}: {
  programSlug: string;
  rating: number;
  content: string;
  title?: string;
}): Promise<ReviewResponse> {
  try {
    const reviewData = {
      rating,
      title,
      content: content.trim(),
    };

    const response = await apiPost(`/programs/${programSlug}/review`, reviewData);

    if (!response.success) {
      throw new Error(
        response.message || "Failed to submit review"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Review submitted successfully",
    };
  } catch (error: any) {
    console.error("Error submitting program review:", error);
    return {
      success: false,
      error: error.message || "Failed to submit review",
    };
  }
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
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("page", page.toString());
    searchParams.set("limit", limit.toString());
    searchParams.set("sortBy", sortBy);

    const query = searchParams.toString() ? `?${searchParams}` : "";
    const response = await apiGet(`/coaches/${coachId}/reviews${query}`, {
      requireAuth: false,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch reviews"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Reviews fetched successfully",
    };
  } catch (error: any) {
    console.error("Error fetching coach reviews:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch reviews",
      data: {
        reviews: [],
        targetEntity: null,
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
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("page", page.toString());
    searchParams.set("limit", limit.toString());
    searchParams.set("sortBy", sortBy);

    const query = searchParams.toString() ? `?${searchParams}` : "";
    const response = await apiGet(`/programs/${programSlug}/reviews${query}`, {
      requireAuth: false,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch reviews"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Reviews fetched successfully",
    };
  } catch (error: any) {
    console.error("Error fetching program reviews:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch reviews",
      data: {
        reviews: [],
        targetEntity: null,
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
