import CatchError from "../../../utils/catch-error";
import { eventController } from "../../../controllers/event.controller";
import { NextRequest } from "next/server";

export const GET = CatchError(
  async (req: NextRequest, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    return await eventController.getEventBySlug(req, slug);
  }
);
