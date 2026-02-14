import { NextRequest } from "next/server";
import { reviewService } from "../services/review.service";
import { targetReviewSchema, reviewQuerySchema } from "@/lib/validations";

export class ReviewController {
  async createReview(
    request: NextRequest,
    targetType: string,
    targetId: string,
  ) {
    const body = await request.json();
    const user = (request as any).user;

    const payload = targetReviewSchema.parse({
      ...body,
      targetType,
      targetId,
    });

    return await reviewService.createReview({
      reviewerId: user.id,
      ...payload,
    });
  }

  async createReviewBySlug(
    request: NextRequest,
    targetType: string,
    slug: string,
  ) {
    const body = await request.json();
    const user = (request as any).user;

    const payload = targetReviewSchema.parse({
      ...body,
      targetType,
    });

    return await reviewService.createReviewBySlug({
      reviewerId: user.id,
      slug,
      ...payload,
    } as any);
  }

  async getReviews(request: NextRequest, targetType: string, targetId: string) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "recent",
    };

    let validatedParams = reviewQuerySchema.parse(queryParams);

    const sortOptions = {
      sortBy: validatedParams.sortBy as "recent" | "rating" | "oldest",
      page: validatedParams.page,
      limit: validatedParams.limit,
    };

    return await reviewService.getReviews(
      targetType as any,
      targetId,
      sortOptions,
    );
  }

  async getReviewsBySlug(
    request: NextRequest,
    targetType: string,
    slug: string,
  ) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "recent",
    };

    let validatedParams = reviewQuerySchema.parse(queryParams);

    const sortOptions = {
      sortBy: validatedParams.sortBy as "recent" | "rating" | "oldest",
      page: validatedParams.page,
      limit: validatedParams.limit,
    };

    return await reviewService.getReviewsBySlug(
      targetType as any,
      slug,
      sortOptions,
    );
  }
}

export const reviewController = new ReviewController();
