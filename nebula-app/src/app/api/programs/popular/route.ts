import { NextRequest } from "next/server";
import { ProgramController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";

const programController = new ProgramController();

export const GET = CatchError(async (request: NextRequest) => {
  return await programController.getPopularPrograms(request);
});