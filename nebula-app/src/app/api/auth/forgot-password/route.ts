import { NextRequest } from "next/server";
import { authController } from "../../controllers/auth.controller";
import catchError from "../../utils/catch-error";

export const POST = catchError(
  async (req: NextRequest) => await authController.forgotPassword(req),
);
