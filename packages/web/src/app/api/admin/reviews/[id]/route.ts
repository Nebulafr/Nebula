import { NextRequest } from "next/server";
import { adminController } from "../../../controllers/admin.controller";
import { requireAdmin } from "../../../middleware/auth";
import CatchError from "../../../utils/catch-error";

export const DELETE = CatchError(
  requireAdmin(
    async (
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      return await adminController.deleteReview(req, id);
    },
  ),
);
