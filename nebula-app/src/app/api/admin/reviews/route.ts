import CatchError from "../../utils/catch-error";
import { AdminController } from "../../controllers/admin.controller";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

const adminController = new AdminController();

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await adminController.getReviews(req)
  )
);