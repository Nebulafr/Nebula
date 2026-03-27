import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middleware/auth";
import CatchError from "../../../utils/catch-error";
import { sessionController } from "../../../controllers/session.controller";

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ sessionId: string }> },
    ) => {
      return await sessionController.rejectSession(request, context);
    },
  ),
);
