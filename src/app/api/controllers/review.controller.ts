import { NextRequest } from "next/server";
import { ReviewService } from "../services/review.service";
import { z } from "zod";

// Validation schemas
const createReviewSchema = z.object({
  targetType: z.enum(["COACH", "PROGRAM"]),
  targetId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(1).max(2000),
  sessionId: z.string().cuid().optional()
});

const getReviewsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(["recent", "rating", "oldest"]).default("recent")
});

export class ReviewController {
  async createReview(request: NextRequest, targetType: string, targetId: string) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new Error("Invalid JSON body");
    }

    const user = (request as any).user;

    if (!user) {
      throw new Error("Authentication required");
    }

    const payload = createReviewSchema.parse({
      ...body,
      targetType,
      targetId
    });

    return await ReviewService.createReview({
      reviewerId: user.id,
      ...payload
    });
  }

  async getReviews(request: NextRequest, targetType: string, targetId: string) {
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "recent"
    };

    const validatedParams = getReviewsSchema.parse(queryParams);

    const sortOptions = {
      sortBy: validatedParams.sortBy as "recent" | "rating" | "oldest",
      page: validatedParams.page,
      limit: validatedParams.limit
    };

    return await ReviewService.getReviews(
      targetType as any,
      targetId,
      sortOptions
    );
  }

}