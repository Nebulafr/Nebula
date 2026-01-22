import { AdminController } from "../../../controllers/admin.controller";
import CatchError from "../../../utils/catch-error";
import { requireAdmin } from "../../../middleware/auth";
import { NextRequest } from "next/server";

const adminController = new AdminController();

export const PATCH = CatchError(
  requireAdmin(
    async (
      req: NextRequest,
      { params }: { params: Promise<{ cohortId: string }> }
    ) => {
      const { cohortId } = await params;
      return await adminController.updateCohort(req, cohortId);
    }
  )
);
