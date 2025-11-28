import { NextRequest } from "next/server";
import { CoachService } from "../services/coach.service";
import { coachQuerySchema, updateCoachProfileSchema } from "../utils/schemas";

export class CoachController {
  async getAll(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const payload = coachQuerySchema.parse(queryParams);
    return await CoachService.getCoaches(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;
    return await CoachService.getProfile(user.id);
  }

  async updateCoach(request: NextRequest) {
    const user = (request as any).user;
    const body = await request.json();

    console.log({ body, user });
    const payload = updateCoachProfileSchema.parse(body);
    return await CoachService.updateCoach(user.id, payload);
  }

  async getById(request: NextRequest, context?: any) {
    const { coachId } = context?.params || {};
    if (!coachId) {
      throw new Error("Coach ID is required");
    }
    return await CoachService.getCoachById(coachId);
  }
}
