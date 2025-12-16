import { CoachController } from "../../controllers/coach.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

const coachController = new CoachController();

export const GET = CatchError(
  async (
    req: NextRequest,
    context: { params: Promise<{ coachId: string }> }
  ) => {
    const { coachId } = await context.params;
    return await coachController.getById(coachId, req);
  }
);
