import { NextRequest } from "next/server";
import { requireAdmin } from "../../../../middleware/auth";
import { AdminController } from "../../../../controllers/admin.controller";
import CatchError from "../../../../utils/catch-error";

const adminController = new AdminController();

export const POST = CatchError(
  requireAdmin(
    async (
      request: NextRequest,
      context: { params: Promise<{ id: string }> }
    ) => {
      const { id } = await context.params;
      return await adminController.updateProgramStatus(request, id);
    }
  )
);
