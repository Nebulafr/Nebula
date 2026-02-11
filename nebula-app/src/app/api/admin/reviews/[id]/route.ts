import CatchError from "../../../utils/catch-error";
import { AdminController } from "../../../controllers/admin.controller";
import { isAuthenticated } from "../../../middleware/auth";
import { NextRequest } from "next/server";

const adminController = new AdminController();

export const DELETE = CatchError(
  isAuthenticated(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      const { id } = await params;
      return await adminController.deleteReview(req, id);
    }
  )
);
