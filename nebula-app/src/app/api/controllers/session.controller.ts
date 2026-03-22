import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import {
  bookSessionSchema,
  rescheduleSessionSchema,
} from "@/lib/validations";
import { sessionService } from "../services/session.service";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/http-exception";
import { SessionFilter } from "../services/types/coach-dashboard.types";
import { sendSuccess } from "../utils/send-response";

export class SessionController {
  async bookSession(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new UnauthorizedException("Student access required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const { coachId } = await context.params;

    const payload = bookSessionSchema.parse({
      ...body,
      coachId,
    });

    const result = await sessionService.bookSession({
      coachId,
      date: payload.date,
      startTime: payload.startTime,
      duration: payload.duration,
      studentUserId: user.id,
      timezone: payload.timezone,
    });
    return sendSuccess(result, "Session booked successfully", 201);
  }

  async getCoachSessions(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "upcoming";

    const result = await sessionService.getCoachSessions(user.id, filter as SessionFilter);
    return sendSuccess(result, "Sessions retrieved successfully");
  }

  async getStudentSessions(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new UnauthorizedException("Student access required");
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "upcoming";

    const result = await sessionService.getStudentSessions(user.id, filter as SessionFilter);
    return sendSuccess(result, "Sessions retrieved successfully");
  }

  async updateSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const { sessionId } = await context.params;

    const result = await sessionService.updateSession(
      sessionId,
      body,
      user.id,
      user.role,
    );
    return sendSuccess(result, "Session updated successfully");
  }

  async cancelSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { sessionId } = await context.params;

    const result = await sessionService.cancelSession(
      sessionId,
      user.id,
      user.role,
      body.reason,
    );
    return sendSuccess(result, "Session cancelled successfully");
  }

  async rescheduleSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = rescheduleSessionSchema.parse(body);

    const { sessionId } = await context.params;

    const result = await sessionService.rescheduleSession({
      sessionId,
      date: payload.date,
      startTime: payload.startTime,
      userId: user.id,
      userRole: user.role,
      timezone: payload.timezone,
    });
    return sendSuccess(result, "Session rescheduled successfully");
  }

  async approveSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { sessionId } = await context.params;

    const result = await sessionService.approveSession(sessionId);
    return sendSuccess(result, "Session approved successfully");
  }

  async rejectSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { sessionId } = await context.params;

    const result = await sessionService.rejectSession(sessionId);
    return sendSuccess(result, "Session rejected successfully");
  }
}

export const sessionController = new SessionController();