import CatchError from "../../../utils/catch-error";
import { AdminController } from "../../../controllers/admin.controller";
import { requireAdmin } from "../../../middleware/auth";

const adminController = new AdminController();

export const GET = CatchError(
  requireAdmin(async () => await adminController.getDashboardStats())
);

