import { programController } from "../controllers/program.controller";
import CatchError from "../utils/catch-error";
import { isAuthenticated } from "../middleware/auth";
import { NextRequest } from "next/server";

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await programController.createProgram(req),
  ),
);

export const GET = CatchError(
  async (req: NextRequest) => await programController.getPrograms(req),
);
