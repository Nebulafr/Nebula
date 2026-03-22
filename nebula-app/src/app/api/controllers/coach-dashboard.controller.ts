import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { coachDashboardService } from "../services/coach-dashboard.service";
import { sendSuccess } from "../utils/send-response";

import { SessionFilter } from "../services/types/coach-dashboard.types";

export class CoachDashboardController {
  async getStats(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const result = await coachDashboardService.getStats(user.id);
    return sendSuccess(result, "Coach stats fetched successfully");
  }

  async getSessions(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "upcoming") as SessionFilter;
    const result = await coachDashboardService.getSessions(user.id, filter);
    return sendSuccess(result, "Sessions fetched successfully");
  }

  async createSession(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const body = await req.json();
    const result = await coachDashboardService.createSession(user.id, body);
    return sendSuccess(result, "Session created successfully", 201);
  }

  async getPrograms(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const result = await coachDashboardService.getPrograms(user.id, status);
    return sendSuccess(result, "Programs fetched successfully");
  }

  async getPayouts(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const result = await coachDashboardService.getRecentPayouts(user.id, limit);
    return sendSuccess(result, "Recent payouts fetched successfully");
  }

  async getStudents(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await coachDashboardService.getStudents(user.id, {
      search,
      page,
      limit,
    });
    return sendSuccess(result, "Students fetched successfully");
  }

  async getEarnings(req: NextRequest) {
    const user = (req as unknown as AuthenticatedRequest).user;
    const result = await coachDashboardService.getEarnings(user.id);
    return sendSuccess(result, "Earnings data fetched successfully");
  }
}

export const coachDashboardController = new CoachDashboardController();

