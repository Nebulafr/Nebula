import { NextRequest } from "next/server";
import { ProgramController } from "../../../controllers/program.controller";
import CatchError from "../../../utils/catch-error";
import { isAuthenticated, requireCoach } from "../../../middleware/auth";


export const GET = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) => {
      const { id } = await params;
      const controller = new ProgramController();
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
      const controller = new ProgramController();
      return await controller.updateById(request, id);
    }
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) => {
      const { id } = await params;
      const controller = new ProgramController();
      if (typeof controller.deleteById !== 'function') {
        console.error('ProgramController.deleteById is missing!', Object.keys(Object.getPrototypeOf(controller)));
      }
      return await controller.deleteById(request, id);
    }
  )
);
