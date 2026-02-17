import { authController } from "../../controllers/auth.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

export const POST = CatchError(
  async (req: NextRequest) => await authController.register(req),
);
