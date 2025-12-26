import { CoachController } from "../../controllers/coach.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

const coachController = new CoachController();

export const GET = CatchError(
  isAuthenticated(async (request: NextRequest) => {
    return await coachController.getSuggestedCoaches(request);
  })
);

