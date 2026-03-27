import { NextRequest } from "next/server";
import { requireCoach } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { coachDashboardController } from "../../controllers/coach-dashboard.controller";

export const GET = CatchError(
  requireCoach(
    async (req: NextRequest) => await coachDashboardController.getStats(req),
  ),
);
