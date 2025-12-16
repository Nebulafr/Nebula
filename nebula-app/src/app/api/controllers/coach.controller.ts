import { NextRequest } from "next/server";
import { CoachService } from "../services/coach.service";
import { coachQuerySchema, updateCoachProfileSchema } from "@/lib/validations";
import {
  BadRequestException,
  ValidationException,
  UnauthorizedException,
} from "../utils/http-exception";
import { z } from "zod";

export class CoachController {
  async getAll(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    let payload;
    try {
      payload = coachQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Invalid query parameters: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

    return await CoachService.getCoaches(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;

    return await CoachService.getProfile(user.id);
  }

  async updateCoach(request: NextRequest) {
    const user = (request as any).user;

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    let payload;
    try {
      payload = updateCoachProfileSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Validation failed: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

    return await CoachService.updateCoach(user.id, payload);
  }

  async getById(coachId?: string, request?: NextRequest) {
    if (!coachId) {
      throw new BadRequestException("Coach ID is required");
    }

    return await CoachService.getCoachById(coachId, request);
  }
}
