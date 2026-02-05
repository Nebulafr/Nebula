import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/google-api";
import { EmailService } from "./email.service";
import { sendSuccess } from "../utils/send-response";
import {
  NotFoundException,
  BadRequestException,
} from "../utils/http-exception";
import moment from "moment-timezone";

interface BookSessionData {
  coachId: string;
  date: string;
  startTime: string;
  duration?: number;
  studentUserId: string;
  timezone?: string;
}

export class SessionService {
  static async bookSession(data: BookSessionData) {
    const { coachId, date, startTime, duration = 60, studentUserId, timezone: providedTimezone } = data;

    // Get coach with Google Calendar tokens and user details
    const coach = await prisma.coach.findUnique({
      where: {
        id: coachId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException("Coach not found");
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      throw new BadRequestException(
        "Please complete your student profile to book sessions"
      );
    }

    // Calculate session times
    const timezone = providedTimezone || student.timeZone || "UTC";
    
    // Extract only the date part if it's an ISO string to avoid timezone shifts during initial parse
    const datePart = date.includes("T") ? date.split("T")[0] : date;
    
    const sessionDateTime = moment.tz(
      `${datePart} ${startTime}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    if (!sessionDateTime.isValid()) {
      throw new BadRequestException("Invalid session date or time format");
    }

    const sessionEndTime = sessionDateTime.clone().add(duration, "minutes");
    const sessionStartDate = sessionDateTime.toDate();
    const sessionEndDate = sessionEndTime.toDate();

    // Check for availability
    await this.verifyCoachAvailability(
      coach,
      sessionDateTime,
      duration
    );

    // Check for conflicts
    await this.checkForConflictingSessions(
      coach.id,
      sessionStartDate,
      sessionEndDate,
      duration
    );

    let meetLink: string | null = null;
    let googleEventId: string | null = null;

    // Create Google Calendar event if coach has connected their calendar
    if (coach.googleCalendarAccessToken) {
      try {
        const calendarResult = await this.createGoogleCalendarEvent(
          coach,
          student,
          sessionDateTime,
          sessionEndTime,
          duration
        );
        meetLink = calendarResult.meetLink;
        googleEventId = calendarResult.googleEventId;
      } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        // Continue with session creation even if calendar event fails
      }
    }

    // Create session and related records
    const sessionResult = await this.createSessionTransaction(
      coach,
      student,
      sessionStartDate,
      duration,
      meetLink,
      googleEventId
    );

    // Send email notifications
    await this.sendSessionNotifications(
      coach,
      student,
      sessionDateTime,
      duration,
      meetLink
    );

    return sendSuccess(
      {
        sessionId: sessionResult.sessionId,
        coachId: coach.id,
        date,
        startTime,
        duration,
        meetLink,
        googleEventId,
      },
      meetLink
        ? "Session booked successfully with Google Meet link created"
        : "Session booked successfully",
      201
    );
  }

  private static async verifyCoachAvailability(
    coach: any,
    sessionDateTime: moment.Moment,
    duration: number
  ) {
    if (!coach.availability) {
      // If no availability is set, we might want to allow booking or block it.
      // For now, let's assume it's required for booking.
      return;
    }

    try {
      const availability = JSON.parse(coach.availability);
      const dayName = sessionDateTime.format("dddd").toLowerCase();
      const dayAvail = availability[dayName];

      if (!dayAvail || !dayAvail.enabled) {
        throw new BadRequestException(`Coach is not available on ${dayName}`);
      }

      const [startHour, startMinute] = dayAvail.startTime.split(":").map(Number);
      const [endHour, endMinute] = dayAvail.endTime.split(":").map(Number);

      const slotStartMinutes =
        sessionDateTime.hours() * 60 + sessionDateTime.minutes();
      const slotEndMinutes = slotStartMinutes + duration;

      const availStartMinutes = startHour * 60 + startMinute;
      const availEndMinutes = endHour * 60 + endMinute;

      if (
        slotStartMinutes < availStartMinutes ||
        slotEndMinutes > availEndMinutes
      ) {
        throw new BadRequestException(
          `Requested time ${sessionDateTime.format("HH:mm")} - ${sessionDateTime
            .clone()
            .add(duration, "minutes")
            .format("HH:mm")} is outside of coach's available hours (${
            dayAvail.startTime
          } - ${dayAvail.endTime})`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error("Error parsing coach availability:", error);
      // If JSON parsing fails, we might want to log it and skip validation or block
    }
  }

  private static async checkForConflictingSessions(
    coachId: string,
    sessionStartDate: Date,
    sessionEndDate: Date,
    duration: number
  ) {
    const conflictingSessions = await prisma.session.findMany({
      where: {
        coachId: coachId,
        status: "SCHEDULED",
        OR: [
          {
            AND: [
              { scheduledTime: { lte: sessionStartDate } },
              {
                scheduledTime: {
                  gte: new Date(
                    sessionStartDate.getTime() - 60000 * duration
                  ),
                },
              },
            ],
          },
          {
            AND: [
              { scheduledTime: { gte: sessionStartDate } },
              { scheduledTime: { lt: sessionEndDate } },
            ],
          },
        ],
      },
    });

    if (conflictingSessions.length > 0) {
      throw new BadRequestException(
        "This time slot conflicts with an existing session"
      );
    }
  }

  private static async createGoogleCalendarEvent(
    coach: any,
    student: any,
    sessionDateTime: moment.Moment,
    sessionEndTime: moment.Moment,
    duration: number
  ) {
    const eventTitle = `Coaching Session with ${student.user?.fullName || "Student"}`;
    const eventDescription = `Coaching session between ${coach.user?.fullName} and ${student.user?.fullName}`;
    const startTimeISO = sessionDateTime.utc().toISOString();
    const endTimeISO = sessionEndTime.utc().toISOString();
    const attendees = [coach.user?.email, student.user?.email].filter(
      Boolean
    ) as string[];

    const calendarEvent = await createCalendarEvent(
      eventTitle,
      eventDescription,
      startTimeISO,
      endTimeISO,
      attendees,
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken
    );

    // If we got a new access token, update it in the database
    if (calendarEvent.newAccessToken) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: {
          googleCalendarAccessToken: calendarEvent.newAccessToken,
          updatedAt: new Date(),
        },
      });
    }

    return {
      meetLink: calendarEvent.meetLink,
      googleEventId: calendarEvent.eventId,
    };
  }

  private static async createSessionTransaction(
    coach: any,
    student: any,
    sessionStartDate: Date,
    duration: number,
    meetLink: string | null,
    googleEventId: string | null
  ) {
    return await prisma.$transaction(async (prisma) => {
      const session = await prisma.session.create({
        data: {
          coachId: coach.id,
          scheduledTime: sessionStartDate,
          duration: duration,
          status: "SCHEDULED",
          title: `Session with ${coach.user?.fullName || "Coach"}`,
          meetLink,
          googleEventId,
        },
      });

      await prisma.coach.update({
        where: { id: coach.id },
        data: {
          totalSessions: { increment: 1 },
        },
      });

      await prisma.sessionAttendance.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          attended: false,
        },
      });

      return { sessionId: session.id, session };
    });
  }

  private static async sendSessionNotifications(
    coach: any,
    student: any,
    sessionDateTime: moment.Moment,
    duration: number,
    meetLink: string | null
  ) {
    try {
      if (!EmailService.validateConfiguration()) {
        console.warn("Email configuration not set up, skipping email notifications");
        return;
      }

      await EmailService.sendSessionBookingEmails(
        coach.user?.email,
        student.user?.email,
        {
          studentName: student.user?.fullName || "Student",
          coachName: coach.user?.fullName || "Coach",
          sessionDate: sessionDateTime.toISOString(),
          duration,
          meetLink: meetLink || undefined,
        }
      );
    } catch (error) {
      console.error("Error sending session notification emails:", error);
      // Don't fail the booking if email sending fails
    }
  }

  static async getCoachSessions(
    userId: string,
    filter: "today" | "upcoming" | "past" | "all" = "upcoming"
  ) {
    const coach = await prisma.coach.findUnique({
      where: { userId },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const whereClause: any = {
      coachId: coach.id,
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        whereClause.scheduledTime = {
          gte: startOfToday,
          lt: endOfToday,
        };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = {
          not: "CANCELLED",
        };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        break;
      case "all":
        // No additional filter
        break;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: filter === "past" ? "desc" : "asc",
      },
    });

    return sendSuccess(
      { sessions: this.transformSessions(sessions) },
      "Sessions retrieved successfully"
    );
  }

  static async getStudentSessions(
    userId: string,
    filter: "today" | "upcoming" | "past" | "all" = "upcoming"
  ) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException("Student profile not found");
    }

    const whereClause: any = {
      attendance: {
        some: {
          studentId: student.id,
        },
      },
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        whereClause.scheduledTime = {
          gte: startOfToday,
          lt: endOfToday,
        };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = {
          not: "CANCELLED",
        };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        break;
      case "all":
        // No additional filter
        break;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        coach: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        attendance: {
          where: {
            studentId: student.id,
          },
        },
      },
      orderBy: {
        scheduledTime: filter === "past" ? "desc" : "asc",
      },
    });

    return sendSuccess(
      { sessions: this.transformSessions(sessions) },
      "Sessions retrieved successfully"
    );
  }

  static async updateSession(
    sessionId: string,
    updateData: any,
    userId: string,
    userRole: string
  ) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    // Check permissions
    const hasPermission =
      userRole === "ADMIN" ||
      (userRole === "COACH" && session.coach.userId === userId) ||
      (userRole === "STUDENT" &&
        session.attendance.some((att) => att.student.userId === userId));

    if (!hasPermission) {
      throw new BadRequestException("You don't have permission to update this session");
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        coach: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session updated successfully"
    );
  }

  static async cancelSession(
    sessionId: string,
    userId: string,
    userRole: string,
    reason?: string
  ) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    // Check permissions
    const hasPermission =
      userRole === "ADMIN" ||
      (userRole === "COACH" && session.coach.userId === userId) ||
      (userRole === "STUDENT" &&
        session.attendance.some((att) => att.student.userId === userId));

    if (!hasPermission) {
      throw new BadRequestException("You don't have permission to cancel this session");
    }

    if (session.status === "CANCELLED") {
      throw new BadRequestException("Session is already cancelled");
    }

    const cancelledSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        notes: reason ? `Cancellation reason: ${reason}` : "Session cancelled",
        updatedAt: new Date(),
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Handle Google Calendar deletion if applicable
    if (session.googleEventId && session.coach.googleCalendarAccessToken) {
      try {
        await this.deleteGoogleCalendarEvent(
          session.coach,
          session.googleEventId
        );
      } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
      }
    }

    // Send email notifications
    const student = session.attendance[0]?.student;
    if (session.coach.user?.email && student?.user?.email) {
      await EmailService.sendSessionCancelledEmails(
        session.coach.user.email,
        student.user.email,
        {
          studentName: student.user.fullName || "Student",
          coachName: session.coach.user.fullName || "Coach",
          sessionDate: session.scheduledTime.toISOString(),
          duration: session.duration,
          reason,
          cancelledBy: userRole === "COACH" ? session.coach.user.fullName || "Coach" : student.user.fullName || "Student",
        }
      );
    }

    return sendSuccess(
      { session: this.transformSession(cancelledSession) },
      "Session cancelled successfully"
    );
  }

  private static async deleteGoogleCalendarEvent(coach: any, eventId: string) {
    const { deleteCalendarEvent } = await import("@/lib/google-api");
    const result = await deleteCalendarEvent(
      eventId,
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken
    );

    if (result.newAccessToken) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { googleCalendarAccessToken: result.newAccessToken },
      });
    }
  }


  private static transformSessions(sessions: any[]) {
    return sessions.map((session) => this.transformSession(session));
  }

  static async rescheduleSession({
    sessionId,
    date,
    startTime,
    userId,
    userRole,
    timezone: providedTimezone,
  }: {
    sessionId: string;
    date: string;
    startTime: string;
    userId: string;
    userRole: string;
    timezone?: string;
  }) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        coach: true,
        attendance: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    // Check permissions
    const hasPermission =
      userRole === "ADMIN" ||
      (userRole === "COACH" && session.coach.userId === userId) ||
      (userRole === "STUDENT" &&
        session.attendance.some((att) => att.student.userId === userId));

    if (!hasPermission) {
      throw new BadRequestException(
        "You don't have permission to reschedule this session"
      );
    }

    if (session.status !== "SCHEDULED") {
      throw new BadRequestException(
        `Cannot reschedule a session that is ${session.status.toLowerCase()}`
      );
    }

    const { coach } = session;
    const student = session.attendance[0]?.student;

    // Parse new time
    const timezone = providedTimezone || student?.timeZone || "UTC";
    // Parse date and time correctly. Avoid timezone shifts during initial parse.
    const datePart = date.includes("T") ? date.split("T")[0] : date;
    const sessionDateTime = moment.tz(
      `${datePart} ${startTime}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );
    const sessionEndTime = sessionDateTime.clone().add(session.duration, "minutes");
    const sessionStartDate = sessionDateTime.toDate();
    const sessionEndDate = sessionEndTime.toDate();

    // Check for availability
    await this.verifyCoachAvailability(
      coach,
      sessionDateTime,
      session.duration
    );

    // Check for conflicts
    const conflictingSessions = await prisma.session.findMany({
      where: {
        coachId: coach.id,
        status: "SCHEDULED",
        id: { not: sessionId }, // Exclude current session
        OR: [
          {
            AND: [
              { scheduledTime: { lte: sessionStartDate } },
              {
                scheduledTime: {
                  gte: new Date(
                    sessionStartDate.getTime() - 60000 * session.duration
                  ),
                },
              },
            ],
          },
          {
            AND: [
              { scheduledTime: { gte: sessionStartDate } },
              { scheduledTime: { lt: sessionEndDate } },
            ],
          },
        ],
      },
    });

    if (conflictingSessions.length > 0) {
      throw new BadRequestException(
        "The new time slot conflicts with an existing session"
      );
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        scheduledTime: sessionStartDate,
        updatedAt: new Date(),
      },
      include: {
        coach: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Handle Google Calendar update if applicable
    if (session.googleEventId && coach.googleCalendarAccessToken) {
      try {
        await this.updateGoogleCalendarEvent(
          coach,
          session.googleEventId,
          sessionDateTime,
          sessionEndTime
        );
      } catch (error) {
        console.error("Error updating Google Calendar event:", error);
      }
    }

    // Send email notifications
    if (updatedSession.coach.user?.email && student?.user?.email) {
      await EmailService.sendSessionRescheduledEmails(
        updatedSession.coach.user.email,
        student.user.email,
        {
          studentName: student.user.fullName || "Student",
          coachName: updatedSession.coach.user.fullName || "Coach",
          sessionDate: sessionStartDate.toISOString(),
          oldDate: session.scheduledTime.toISOString(),
          duration: session.duration,
          rescheduledBy: userRole === "COACH" ? updatedSession.coach.user.fullName || "Coach" : student.user.fullName || "Student",
          meetLink: session.meetLink || undefined,
        }
      );
    }

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session rescheduled successfully"
    );
  }


  private static async updateGoogleCalendarEvent(
    coach: any,
    eventId: string,
    startTime: moment.Moment,
    endTime: moment.Moment
  ) {
    const { updateCalendarEvent } = await import("@/lib/google-api");
    const result = await updateCalendarEvent(
      eventId,
      startTime.toISOString(),
      endTime.toISOString(),
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken
    );

    if (result.newAccessToken) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { googleCalendarAccessToken: result.newAccessToken },
      });
    }
  }


  private static transformSession(session: any) {
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      scheduledTime: session.scheduledTime.toISOString(),
      duration: session.duration,
      status: session.status,
      meetLink: session.meetLink,
      googleEventId: session.googleEventId,
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      coach: session.coach
        ? {
            id: session.coach.id,
            fullName: session.coach.user?.fullName,
            email: session.coach.user?.email,
            avatarUrl: session.coach.user?.avatarUrl,
          }
        : null,
      attendance: session.attendance
        ? session.attendance.map((att: any) => ({
            id: att.id,
            attended: att.attended,
            joinTime: att.joinTime?.toISOString(),
            leaveTime: att.leaveTime?.toISOString(),
            participationScore: att.participationScore,
            student: att.student
              ? {
                  id: att.student.id,
                  fullName: att.student.user?.fullName,
                  email: att.student.user?.email,
                  avatarUrl: att.student.user?.avatarUrl,
                }
              : null,
          }))
        : [],
    };
  }
}