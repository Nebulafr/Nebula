import { NextRequest } from "next/server";
import {
  bookSessionSchema,
  rescheduleSessionSchema,
} from "@/lib/validations";
import { sessionService } from "../services/session.service";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/http-exception";

export class SessionController {
  async bookSession(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new UnauthorizedException("Student access required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const { coachId } = await context.params;

    const payload = bookSessionSchema.parse({
      ...body,
      coachId,
    });

    return await sessionService.bookSession({
      coachId,
      date: payload.date,
      startTime: payload.startTime,
      duration: payload.duration,
      studentUserId: user.id,
      timezone: payload.timezone,
    });
  }

  async getCoachSessions(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "upcoming";

    return await sessionService.getCoachSessions(user.id, filter as any);
  }

  async getStudentSessions(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new UnauthorizedException("Student access required");
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "upcoming";

    return await sessionService.getStudentSessions(user.id, filter as any);
  }

  async updateSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const { sessionId } = await context.params;

    return await sessionService.updateSession(
      sessionId,
      body,
      user.id,
      user.role,
    );
  }

  async cancelSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      body = {};
    }

    const { sessionId } = await context.params;

    return await sessionService.cancelSession(
      sessionId,
      user.id,
      user.role,
      body.reason,
    );
  }

  async rescheduleSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = rescheduleSessionSchema.parse(body);

    const { sessionId } = await context.params;

    return await sessionService.rescheduleSession({
      sessionId,
      date: payload.date,
      startTime: payload.startTime,
      userId: user.id,
      userRole: user.role,
      timezone: payload.timezone,
    });
  }

  async approveSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { sessionId } = await context.params;

    return await sessionService.approveSession(sessionId);
  }

  async rejectSession(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> },
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const { sessionId } = await context.params;

    return await sessionService.rejectSession(sessionId);
  }
}

export const sessionController = new SessionController();