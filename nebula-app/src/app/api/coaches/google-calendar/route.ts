import { NextRequest } from "next/server";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { CoachController } from "../../controllers/coach.controller";

const coachController = new CoachController();

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachController.connectGoogleCalendar(req)
  )
);