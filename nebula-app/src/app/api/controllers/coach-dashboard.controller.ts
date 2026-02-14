import { NextRequest } from "next/server";
import { coachDashboardService } from "../services/coach-dashboard.service";

import { SessionFilter } from "../services/types/coach-dashboard.types";

export class CoachDashboardController {
  async getStats(req: NextRequest) {
    const user = (req as any).user;
    return await coachDashboardService.getStats(user.id);
  }

  async getSessions(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "upcoming") as SessionFilter;
    return await coachDashboardService.getSessions(user.id, filter);
  }

  async createSession(req: NextRequest) {
    const user = (req as any).user;
    const body = await req.json();
    return await coachDashboardService.createSession(user.id, body);
  }

  async getPrograms(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    return await coachDashboardService.getPrograms(user.id, status);
  }

  async getPayouts(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    return await coachDashboardService.getRecentPayouts(user.id, limit);
  }

  async getStudents(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    return await coachDashboardService.getStudents(user.id, {
      search,
      page,
      limit,
    });
  }
}

export const coachDashboardController = new CoachDashboardController();

