import { NextRequest } from "next/server";
import { requireCoach } from "../../../../middleware/auth";
import CatchError from "../../../../utils/catch-error";
import { ProgramController } from "../../../../controllers/program.controller";

const controller = new ProgramController();

export const POST = CatchError(
  requireCoach(
    async (
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      return await controller.submitProgram(req, id);
    },
  ),
);
