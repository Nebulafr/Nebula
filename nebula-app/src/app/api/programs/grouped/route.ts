import { ProgramController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

const programController = new ProgramController();

export const GET = CatchError(
  async (req: NextRequest) => await programController.getGroupedPrograms(req)
);
