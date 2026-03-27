import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { reviewService } from "../services/review.service";
import { targetReviewSchema, reviewQuerySchema } from "@/lib/validations/review";
import { sendSuccess } from "../utils/send-response";

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
      const result = await reviewService.createCoachReview({
        reviewerId: user.id,
        targetId: payload.targetId,
        rating: payload.rating,
        content: payload.content,
        sessionId: payload.sessionId,
      });
      return sendSuccess(result, "Coach review submitted successfully", 201);
    } else {
      const result = await reviewService.createProgramReview({
        reviewerId: user.id,
        targetId: payload.targetId,
        rating: payload.rating,
        content: payload.content,
      });
      return sendSuccess(result, "Program review submitted successfully", 201);
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
      const result = await reviewService.createProgramReviewBySlug({
        reviewerId: user.id,
        slug,
        rating: payload.rating,
        content: payload.content,
      });
      return sendSuccess(result, "Program review submitted successfully", 201);
    } else {
      // For COACH type, slug is the coach targetId
      const result = await reviewService.createCoachReview({
        reviewerId: user.id,
        targetId: slug,
        rating: payload.rating,
        content: payload.content,
        sessionId: payload.sessionId,
      });
      return sendSuccess(result, "Coach review submitted successfully", 201);
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
      const result = await reviewService.getCoachReviews(targetId, sortOptions);
      return sendSuccess(result, "Coach reviews fetched successfully");
    } else {
      const result = await reviewService.getProgramReviews(targetId, sortOptions);
      return sendSuccess(result, "Program reviews fetched successfully");
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
      const result = await reviewService.getCoachReviews(slug, sortOptions);
      return sendSuccess(result, "Coach reviews fetched successfully");
    } else {
      const result = await reviewService.getProgramReviewsBySlug(slug, sortOptions);
      return sendSuccess(result, "Program reviews fetched successfully");
    }
  }
}

export const reviewController = new ReviewController();
