import { NextRequest } from "next/server";
import { AuthController } from "../../controllers/auth.controller";
import catchError from "../../utils/catch-error";

export const POST = catchError(async (req: NextRequest) => {
  const controller = new AuthController();
  return await controller.forgotPassword(req);
});
