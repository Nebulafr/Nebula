import { adminController } from "../../controllers/admin.controller";
import CatchError from "../../utils/catch-error";
import { requireAdmin } from "../../middleware/auth";
import { NextRequest } from "next/server";

export const GET = CatchError(
  requireAdmin(
    async (req: NextRequest) => await adminController.getPrograms(req),
  ),
);
