import CatchError from "../utils/catch-error";
import { eventController } from "../controllers/event.controller";
import { isAuthenticated } from "../middleware/auth";
import { NextRequest } from "next/server";

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await eventController.createEvent(req)
  )
);

export const GET = CatchError(
  async (req: NextRequest) => await eventController.getEvents(req)
);
