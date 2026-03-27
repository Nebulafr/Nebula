import CatchError from "../../../utils/catch-error";
import { adminController } from "../../../controllers/admin.controller";
import { requireAdmin } from "../../../middleware/auth";
import { NextRequest } from "next/server";

export const PATCH = CatchError(
  requireAdmin(
    async (
      req: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await adminController.updateUser(req, { params: { id } });
    },
  ),
);

export const DELETE = CatchError(
  requireAdmin(
    async (
      req: NextRequest,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      return await adminController.deleteUser(req, id);
    },
  ),
);
