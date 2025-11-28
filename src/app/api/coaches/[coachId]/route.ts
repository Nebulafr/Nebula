import { CoachController } from "../../controllers/coach.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

const coachController = new CoachController();

export const GET = CatchError(
  async (req: NextRequest, context?: any) => await coachController.getById(req, context)
);
