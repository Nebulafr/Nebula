import { NextRequest } from "next/server";
import { programController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";

export const GET = CatchError(
  async (request: NextRequest) =>
    await programController.getPopularPrograms(request),
);