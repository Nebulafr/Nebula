import { NextRequest } from "next/server";
import { reviewController } from "../../../../controllers/review.controller";
import CatchError from "../../../../utils/catch-error";

export const GET = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ slug: string }> },
  ) => {
    const { slug } = await context.params;
    return await reviewController.getReviewsBySlug(request, "PROGRAM", slug);
  },
);
