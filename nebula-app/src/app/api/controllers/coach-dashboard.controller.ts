import { NextRequest } from "next/server";
import { CoachDashboardService } from "../services/coach-dashboard.service";

export class CoachDashboardController {
  async getStats(req: NextRequest) {
    const user = (req as any).user;
    return await CoachDashboardService.getStats(user.id);
  }

  async getSessions(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "upcoming";
    return await CoachDashboardService.getSessions(user.id, filter);
  }

  async createSession(req: NextRequest) {
    const user = (req as any).user;
    const body = await req.json();
    return await CoachDashboardService.createSession(user.id, body);
  }

  async getPrograms(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    return await CoachDashboardService.getPrograms(user.id, status);
  }

  async getPayouts(req: NextRequest) {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    return await CoachDashboardService.getRecentPayouts(user.id, limit);
  }

  async getStudents(req: NextRequest) {
    const user = (req as any).user;
    return await CoachDashboardService.getStudents(user.id);
  }
}

