import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { sessionController } from "../../controllers/session.controller";

export const GET = CatchError(
  isAuthenticated(
    async (request: NextRequest) => {
      return await sessionController.getStudentSessions(request);
    }
  )
);