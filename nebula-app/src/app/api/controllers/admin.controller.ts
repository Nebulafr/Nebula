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
    };

    return await AdminService.getUsers(queryParams);
  }

  async getReviews(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      targetType: searchParams.get("targetType") || undefined,
      status: searchParams.get("status") || undefined,
      rating: searchParams.get("rating") || undefined,
    };

    return await AdminService.getReviews(queryParams);
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
    };

    return await AdminService.getEvents(queryParams);
  }
}
