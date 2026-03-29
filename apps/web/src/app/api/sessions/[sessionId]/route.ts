import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { sessionController } from "../../controllers/session.controller";

export const GET = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ sessionId: string }> },
    ) => {
      // For now, let's just implement the update and single fetch if needed
      // SessionController.updateSession is already implemented
      return await sessionController.updateSession(request, context);
    },
  ),
);

export const PATCH = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ sessionId: string }> },
    ) => {
      return await sessionController.updateSession(request, context);
    },
  ),
);
