import { NextRequest } from "next/server";
import { eventController } from "../../controllers/event.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";

export const GET = CatchError(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    return await eventController.getEvent(params.id);
  }
);

export const PUT = CatchError(
  isAuthenticated(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
      return await eventController.updateEvent(req, params.id);
    }
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
      return await eventController.deleteEvent(params.id);
    }
  )
);
