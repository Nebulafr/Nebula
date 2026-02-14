import { NextRequest } from "next/server";
import { eventController } from "@/app/api/controllers/event.controller";
import CatchError from "@/app/api/utils/catch-error";
import { isAuthenticated } from "@/app/api/middleware/auth";

export const POST = CatchError(
  isAuthenticated(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await eventController.registerForEvent(request, id);
  })
);

export const DELETE = CatchError(
  isAuthenticated(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await eventController.unregisterFromEvent(request, id);
  })
);