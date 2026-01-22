import { ProgramController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

const programController = new ProgramController();

export const GET = CatchError(
  isAuthenticated(
    async (request: NextRequest) =>
      await programController.getRecommendedPrograms(request)
  )
);
