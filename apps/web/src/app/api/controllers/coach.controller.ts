import { NextRequest, NextResponse } from "next/server";
import { type AuthenticatedRequest } from "@/types";
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
import { sendSuccess } from "../utils/send-response";

export class CoachController {
  async getAll(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      company: searchParams.get("company") || undefined,
      school: searchParams.get("school") || undefined,
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
    };

    const payload = coachQuerySchema.parse(queryParams);

    const result = await coachService.getCoaches(payload);
    return sendSuccess(result, "Coaches retrieved successfully");
  }

  async getProfile(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    const result = await coachService.getProfile(user.id);
    return sendSuccess(result, "Coach profile fetched successfully");
  }

  async createCoach(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = createCoachSchema.parse(body);

    const result = await coachService.createCoach(user.id, payload);
    return sendSuccess(result, "Coach profile created successfully", 201);
  }

  async updateCoach(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = updateCoachProfileSchema.parse(body);

    const result = await coachService.updateCoach(user.id, payload);
    return sendSuccess(result, "Coach profile updated successfully");
  }

  async updateExperiences(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const { updateCoachExperiencesSchema } = await import("@/lib/validations");
    const payload = updateCoachExperiencesSchema.parse(body);

    const result = await coachService.updateCoachExperiences(user.id, payload.experiences);
    return sendSuccess(result, "Coach experiences updated successfully");
  }

  async getExperiences(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    const result = await coachService.getCoachExperiences(user.id);
    return sendSuccess(result, "Coach experiences fetched successfully");
  }

  async getById(coachId?: string, request?: NextRequest): Promise<NextResponse> {
    if (!coachId) {
      throw new BadRequestException("Coach ID is required");
    }

    let userId: string | undefined;
    if (request) {
      const { extractUserFromRequest } = await import("../utils/extract-user");
      const user = await extractUserFromRequest(request);
      userId = user?.id;
    }

    const result = await coachService.getCoachById(coachId, userId);
    return sendSuccess(result, "Coach profile fetched successfully");
  }

  async getSuggestedCoaches(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");

    const result = await coachService.getSuggestedCoaches(user.id, limit);
    return sendSuccess(result, "Suggested coaches fetched successfully");
  }

  async connectGoogleCalendar(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    const body = await request.json();

    const { googleCalendarAccessToken, googleCalendarRefreshToken } = body;

    if (!googleCalendarAccessToken) {
      throw new BadRequestException("Google Calendar access token is required");
    }

    await coachService.connectGoogleCalendar(
      user.id,
      googleCalendarAccessToken,
      googleCalendarRefreshToken,
    );
    return sendSuccess(null, "Google Calendar connected successfully");
  }

  async getAvailability(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;
    const result = await coachService.getAvailability(user.id);
    return sendSuccess(result, "Availability fetched successfully");
  }

  async updateAvailability(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;
    const body = await request.json();
    const result = await coachService.updateAvailability(user.id, body.availability);
    return sendSuccess(result, "Availability updated successfully");
  }
}

export const coachController = new CoachController();
