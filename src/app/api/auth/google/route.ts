import { AuthController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

const authController = new AuthController();

export const POST = CatchError(
  async (req: NextRequest) => await authController.googleAuth(req)
);
