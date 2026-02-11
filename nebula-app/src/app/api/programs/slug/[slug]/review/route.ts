import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../../middleware/auth";
import CatchError from "../../../../utils/catch-error";
import { ReviewController } from "../../../../controllers/review.controller";

const reviewController = new ReviewController();

export const POST = CatchError(
  isAuthenticated(
    async (request: NextRequest, context: { params: Promise<{ slug: string }> }) => {
      const { slug } = await context.params;
      return await reviewController.createReviewBySlug(request, "PROGRAM", slug);
    }
  )
);