import { NextRequest } from "next/server";
import catchError from "../utils/catch-error";
import { agentsController } from "../controllers/agents.controller";

export const POST = catchError(
  async (req: NextRequest) => await agentsController.processAgentRequest(req),
);
