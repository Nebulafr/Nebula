import { programController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

export const GET = CatchError(
  async (req: NextRequest) => await programController.getGroupedPrograms(req),
);
