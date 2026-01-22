import { NextRequest } from "next/server";
import { ProgramController } from "../../../controllers/program.controller";
import CatchError from "../../../utils/catch-error";
import { isAuthenticated, requireCoach } from "../../../middleware/auth";

const controller = new ProgramController();

export const GET = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) => {
      const { id } = await params;
      return await controller.getById(request, id);
    }
  )
);

export const PUT = CatchError(
  requireCoach(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) => {
      const { id } = await params;
      return await controller.updateById(request, id);
    }
  )
);
