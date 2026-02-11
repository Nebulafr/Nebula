import { NextRequest } from "next/server";
import { AdminService } from "../services/admin.service";
import {
  adminProgramQuerySchema,
  programActionSchema,
} from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

export class AdminController {
  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const payload = adminProgramQuerySchema.parse(queryParams);
    return await AdminService.getPrograms(payload);
  }

  async updateProgramStatus(request: NextRequest, programId: string) {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    const body = await request.json();
    const payload = programActionSchema.parse(body);

    return await AdminService.updateProgramStatus(programId, payload);
  }

  async getUsers(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminUserQuerySchema } = await import("@/lib/validations");
    const payload = adminUserQuerySchema.parse(queryParams);
    return await AdminService.getUsers(payload);
  }

  async getReviews(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      targetType: searchParams.get("targetType") || undefined,
      status: searchParams.get("status") || undefined,
      rating: searchParams.get("rating") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminReviewQuerySchema } = await import("@/lib/validations");
    const payload = adminReviewQuerySchema.parse(queryParams);
    return await AdminService.getReviews(payload);
  }

  async getDashboardStats() {
    return await AdminService.getDashboardStats();
  }

  async getRecentSignups(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    return await AdminService.getRecentSignups(limit);
  }

  async getPlatformActivity(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    return await AdminService.getPlatformActivity(limit);
  }

  async getEvents(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminEventQuerySchema } = await import("@/lib/validations");
    const payload = adminEventQuerySchema.parse(queryParams);
    return await AdminService.getEvents(payload);
  }

  async updateCohort(request: NextRequest, cohortId: string) {
    if (!cohortId) {
      throw new BadRequestException("Cohort ID is required");
    }

    const body = await request.json();
    return await AdminService.updateCohort(cohortId, body);
  }

  async getCohortsByProgram(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    return await AdminService.getCohortsByProgram(programId);
  }

  async createCohort(request: NextRequest) {
    const body = await request.json();
    const { programId, name, startDate, maxStudents } = body;

    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    return await AdminService.createCohort(programId, { name, startDate, maxStudents });
  }

  async deleteReview(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Review ID is required");
    }

    const { ReviewService } = await import("../services/review.service");
    return await ReviewService.deleteReview(id);
  }
}
