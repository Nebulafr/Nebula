import { authController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await authController.getProfile(req),
  ),
);

export const PUT = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await authController.updateProfile(req),
  ),
);
