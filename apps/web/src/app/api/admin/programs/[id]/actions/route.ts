import { NextRequest } from "next/server";
import { requireAdmin } from "../../../../middleware/auth";
import { adminController } from "../../../../controllers/admin.controller";
import CatchError from "../../../../utils/catch-error";

export const POST = CatchError(
  requireAdmin(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await adminController.updateProgramStatus(request, id);
    },
  ),
);
