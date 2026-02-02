import { AuthController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

const authController = new AuthController();

export const GET = CatchError(
  async (req: NextRequest) => await authController.verifyEmail(req)
);
