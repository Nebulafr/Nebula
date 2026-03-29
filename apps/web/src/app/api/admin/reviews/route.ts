import { NextRequest } from "next/server";
import { adminController } from "../../controllers/admin.controller";
import { requireAdmin } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";

export const GET = CatchError(
  requireAdmin(
    async (req: NextRequest) => await adminController.getReviews(req),
  ),
);