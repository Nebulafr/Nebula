import { coachController } from "../controllers/coach.controller";
import CatchError from "../utils/catch-error";
import { NextRequest } from "next/server";

export const GET = CatchError(
  async (req: NextRequest) => await coachController.getAll(req),
);
