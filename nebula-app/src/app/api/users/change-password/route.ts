import { AuthController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

const authController = new AuthController();

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await authController.changePassword(req)
  )
);
