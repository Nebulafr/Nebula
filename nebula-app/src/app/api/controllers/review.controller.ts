import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { reviewService } from "../services/review.service";
import { targetReviewSchema, reviewQuerySchema } from "@/lib/validations/review";

export class ReviewController {
  async createReview(
    request: NextRequest,
    targetType: string,
    targetId: string,
  ) {
    const body = await request.json();
    const user = (request as unknown as AuthenticatedRequest).user;

    const payload = targetReviewSchema.parse({
      ...body,
      targetType,
      targetId,
    });

    if (targetType === "COACH") {
      return await reviewService.createCoachReview({
        reviewerId: user.id,
        targetId: payload.targetId,
        rating: payload.rating,
        content: payload.content,
        sessionId: payload.sessionId,
      });
    } else {
      return await reviewService.createProgramReview({
        reviewerId: user.id,
        targetId: payload.targetId,
        rating: payload.rating,
        content: payload.content,
      });
    }
  }

  async createReviewBySlug(
    request: NextRequest,
    targetType: string,
    slug: string,
  ) {
    const body = await request.json();
    const user = (request as unknown as AuthenticatedRequest).user;

    const payload = targetReviewSchema.parse({
      ...body,
      targetType,
      targetId: targetType === "COACH" ? slug : "placeholder", // targetId is required by schema, slug is the Id for coaches
    });

    if (targetType === "PROGRAM") {
      return await reviewService.createProgramReviewBySlug({
        reviewerId: user.id,
        slug,
        rating: payload.rating,
        content: payload.content,
      });
    } else {
      // For COACH type, slug is the coach targetId
      return await reviewService.createCoachReview({
        reviewerId: user.id,
        targetId: slug,
        rating: payload.rating,
        content: payload.content,
        sessionId: payload.sessionId,
      });
    }
  }

  async getReviews(request: NextRequest, targetType: string, targetId: string) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "recent",
    };

    const validatedParams = reviewQuerySchema.parse(queryParams);

    const sortOptions = {
      sortBy: validatedParams.sortBy as "recent" | "rating" | "oldest",
      page: validatedParams.page,
      limit: validatedParams.limit,
    };

    if (targetType === "COACH") {
      return await reviewService.getCoachReviews(targetId, sortOptions);
    } else {
      return await reviewService.getProgramReviews(targetId, sortOptions);
    }
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

    const validatedParams = reviewQuerySchema.parse(queryParams);

    const sortOptions = {
      sortBy: validatedParams.sortBy as "recent" | "rating" | "oldest",
      page: validatedParams.page,
      limit: validatedParams.limit,
    };

    if (targetType === "COACH") {
      // For coaches, slug is the coachId
      return await reviewService.getCoachReviews(slug, sortOptions);
    } else {
      return await reviewService.getProgramReviewsBySlug(slug, sortOptions);
    }
  }
}

export const reviewController = new ReviewController();
