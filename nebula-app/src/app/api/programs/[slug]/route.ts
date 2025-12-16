import { ProgramController } from "../../controllers/program.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

const programController = new ProgramController();

export const GET = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
  ) => {
    const { slug } = await context.params;
    return await programController.getBySlug(request, slug);
  }
);

export const PUT = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> }
    ) => {
      const { slug } = await context.params;
      return await programController.updateProgram(request, slug);
    }
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> }
    ) => {
      const { slug } = await context.params;
      return await programController.deleteProgram(request, slug);
    }
  )
);
