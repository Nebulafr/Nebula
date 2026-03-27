import { NextRequest } from "next/server";
import { programController } from "../../../controllers/program.controller";
import CatchError from "../../../utils/catch-error";
import { isAuthenticated, requireCoach } from "../../../middleware/auth";

export const GET = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await programController.getById(request, id);
    },
  ),
);

export const PUT = CatchError(
  requireCoach(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await programController.updateById(request, id);
    },
  ),
);

export const DELETE = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await programController.deleteById(request, id);
    },
  ),
);
