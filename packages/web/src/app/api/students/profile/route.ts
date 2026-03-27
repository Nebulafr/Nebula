import { studentController } from "../../controllers/student.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";
import { NextRequest } from "next/server";

export const PUT = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await studentController.updateProfile(req),
  ),
);

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await studentController.getProfile(req),
  ),
);
