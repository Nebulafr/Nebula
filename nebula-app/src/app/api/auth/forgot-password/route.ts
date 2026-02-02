import { NextRequest } from "next/server";
import { AuthController } from "../../controllers/auth.controller";
import catchError from "../../utils/catch-error";

const controller = new AuthController();

export const POST = catchError(
  async (req: NextRequest) => await controller.forgotPassword(req)
);
