import { NextRequest } from "next/server";
import CatchError from "../../../utils/catch-error";
import { ReviewController } from "../../../controllers/review.controller";

const reviewController = new ReviewController();

export const GET = CatchError(
  async (request: NextRequest, context: { params: Promise<{ coachId: string }> }) => {
    const { coachId } = await context.params;
    return await reviewController.getReviews(request, "COACH", coachId);
  }
);
