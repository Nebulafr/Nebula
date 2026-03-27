import { NextRequest } from "next/server";
import CatchError from "../../../utils/catch-error";
import { isAuthenticated } from "../../../middleware/auth";
import { coachController } from "../../../controllers/coach.controller";

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachController.getExperiences(req),
  ),
);

export const PUT = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachController.updateExperiences(req),
  ),
);

export const PATCH = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await coachController.updateExperiences(req),
  ),
);
