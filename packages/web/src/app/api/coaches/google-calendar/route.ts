import { NextRequest } from "next/server";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { coachController } from "../../controllers/coach.controller";

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachController.connectGoogleCalendar(req),
  ),
);