import { NextRequest } from "next/server";
import { requireCoach } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { coachController } from "../../controllers/coach.controller";

// GET /api/coaches/availability - Get coach's availability settings
export const GET = CatchError(
  requireCoach(
    async (req: NextRequest) => await coachController.getAvailability(req),
  ),
);

// PUT /api/coaches/availability - Update coach's availability settings
export const PUT = CatchError(
  requireCoach(
    async (req: NextRequest) => await coachController.updateAvailability(req),
  ),
);

