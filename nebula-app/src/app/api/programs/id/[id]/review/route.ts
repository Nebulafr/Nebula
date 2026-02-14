import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../../middleware/auth";
import CatchError from "../../../../utils/catch-error";
import { reviewController } from "../../../../controllers/review.controller";

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await reviewController.createReview(request, "PROGRAM", id);
    },
  ),
);
