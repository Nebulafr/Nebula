import { authController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

export const GET = CatchError(
  async (req: NextRequest) => await authController.verifyEmail(req),
);
