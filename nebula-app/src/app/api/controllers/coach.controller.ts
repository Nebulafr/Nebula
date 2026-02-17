import { NextRequest } from "next/server";
import { coachService } from "../services/coach.service";
import {
  coachQuerySchema,
  updateCoachProfileSchema,
  createCoachSchema,
} from "@/lib/validations";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/http-exception";

export class CoachController {
  async getAll(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "true";

    const queryParams = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const payload = coachQuerySchema.parse(queryParams);

    if (grouped) {
      return await coachService.getGroupedCoaches(payload);
    }

    return await coachService.getCoaches(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;

    return await coachService.getProfile(user.id);
  }

  async createCoach(request: NextRequest) {
    const user = (request as any).user;

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = createCoachSchema.parse(body);

    return await coachService.createCoach(user.id, payload);
  }

  async updateCoach(request: NextRequest) {
    const user = (request as any).user;

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = updateCoachProfileSchema.parse(body);

    return await coachService.updateCoach(user.id, payload);
  }

  async getById(coachId?: string, request?: NextRequest) {
    if (!coachId) {
      throw new BadRequestException("Coach ID is required");
    }

    return await coachService.getCoachById(coachId, request);
  }

  async getSuggestedCoaches(request: NextRequest) {
    const user = (request as any).user;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");

    return await coachService.getSuggestedCoaches(user.id, limit);
  }

  async connectGoogleCalendar(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    const body = await request.json();

    const { googleCalendarAccessToken, googleCalendarRefreshToken } = body;

    if (!googleCalendarAccessToken) {
      throw new BadRequestException("Google Calendar access token is required");
    }

    return await coachService.connectGoogleCalendar(
      user.id,
      googleCalendarAccessToken,
      googleCalendarRefreshToken,
    );
  }

  async getAvailability(request: NextRequest) {
    const user = (request as any).user;
    return await coachService.getAvailability(user.id);
  }

  async updateAvailability(request: NextRequest) {
    const user = (request as any).user;
    const body = await request.json();
    return await coachService.updateAvailability(user.id, body.availability);
  }
}

export const coachController = new CoachController();
