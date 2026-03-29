import CatchError from "../../../utils/catch-error";
import { adminController } from "../../../controllers/admin.controller";
import { requireAdmin } from "../../../middleware/auth";

export const GET = CatchError(
  requireAdmin(async () => await adminController.getDashboardStats()),
);

