import { NextRequest } from "next/server";
import catchError from "../utils/catch-error";
import { agentsController } from "../controllers/agents.controller";
import { isAuthenticated } from "../middleware/auth";

export const maxDuration = 60; // 60 seconds

export const POST = catchError(
  isAuthenticated(async (req: NextRequest) => await agentsController.processAgentRequest(req)),
);
