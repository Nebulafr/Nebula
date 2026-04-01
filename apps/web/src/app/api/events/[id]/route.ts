import { NextRequest } from "next/server";
import { eventController } from "../../controllers/event.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";

export const GET = CatchError(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await eventController.getEvent(id);
  }
);

export const PUT = CatchError(
  isAuthenticated(
    async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
      const { id } = await context.params;
      return await eventController.updateEvent(req, id);
    }
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
      const { id } = await context.params;
      return await eventController.deleteEvent(req, id);
    }
  )
);
