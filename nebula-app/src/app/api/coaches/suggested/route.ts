import { coachController } from "../../controllers/coach.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

export const GET = CatchError(
  isAuthenticated(async (request: NextRequest) => {
    return await coachController.getSuggestedCoaches(request);
  }),
);

