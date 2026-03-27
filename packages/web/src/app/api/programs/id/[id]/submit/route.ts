import { NextRequest } from "next/server";
import { requireCoach } from "../../../../middleware/auth";
import CatchError from "../../../../utils/catch-error";
import { programController } from "../../../../controllers/program.controller";

export const POST = CatchError(
  requireCoach(
    async (
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      return await programController.submitProgram(req, id);
    },
  ),
);
