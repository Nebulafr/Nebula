import { NextRequest } from "next/server";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { coachDashboardController } from "../../controllers/coach-dashboard.controller";

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachDashboardController.getPayouts(req),
  ),
);
