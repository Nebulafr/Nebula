import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middleware/auth";
import CatchError from "../../../utils/catch-error";
import { SessionController } from "../../../controllers/session.controller";

const sessionController = new SessionController();

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ sessionId: string }> }
    ) => {
      return await sessionController.approveSession(request, context);
    }
  )
);
