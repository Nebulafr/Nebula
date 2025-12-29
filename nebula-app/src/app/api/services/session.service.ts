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
}

export class SessionService {
  static async bookSession(data: BookSessionData) {
    const { coachId, date, startTime, duration = 60, studentUserId } = data;

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
    const timezone = student.timeZone || "UTC";
    const sessionDateTime = moment.tz(
      `${date.split("T")[0]} ${startTime}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    if (!sessionDateTime.isValid()) {
      throw new BadRequestException("Invalid session date or time format");
    }

    const sessionEndTime = sessionDateTime.clone().add(duration, "minutes");
    const sessionStartDate = sessionDateTime.toDate();
    const sessionEndDate = sessionEndTime.toDate();

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
    });

    return sendSuccess(
      { session: this.transformSession(cancelledSession) },
      "Session cancelled successfully"
    );
  }

  private static transformSessions(sessions: any[]) {
    return sessions.map((session) => this.transformSession(session));
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