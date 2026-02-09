import { NextRequest } from "next/server";
import { requireCoach } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { CoachDashboardController } from "../../controllers/coach-dashboard.controller";

const controller = new CoachDashboardController();

export const GET = CatchError(
  requireCoach(async (req: NextRequest) => await controller.getStudents(req))
);
