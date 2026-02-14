import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@/generated/prisma";
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

    const result = await prisma.$transaction(async (tx) => {
      // Get coach with Google Calendar tokens and user details
      const coach = await tx.coach.findUnique({
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
      const student = await tx.student.findUnique({
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
        duration,
        undefined,
        tx
      );

      // Check for student conflicts
      await this.checkStudentConflicts(
        student.id,
        sessionStartDate,
        sessionEndDate,
        duration,
        undefined,
        tx
      );

      // Create session and related records
      const session = await tx.session.create({
        data: {
          coachId,
          scheduledTime: sessionDateTime.toDate(),
          duration,
          status: SessionStatus.REQUESTED,
          attendance: {
            create: {
              studentId: student.id,
            },
          },
        },
        include: {
          attendance: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
          coach: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        coach,
        student,
        session,
        sessionDateTime,
      };
    }, { timeout: 15000 });

    const { coach, student, session, sessionDateTime } = result;

    // Send email notifications outside transaction
    // For now, let's keep it here for the initial request notification
    await this.sendSessionNotifications(
      coach,
      student,
      sessionDateTime,
      duration,
      null // No meet link yet for requested sessions
    );

    return sendSuccess(
      { session: this.transformSession(session) },
      "Session booked successfully"
    );
  }

  static async approveSession(sessionId: string) {
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

    if (session.status !== "REQUESTED") {
      throw new BadRequestException("Only requested sessions can be approved");
    }

    // Check for conflicts before approving
    const sessionStartDate = session.scheduledTime;
    const sessionEndDate = moment(session.scheduledTime)
      .add(session.duration, "minutes")
      .toDate();

    let meetLink = null;
    let googleEventId = null;

    // Create Google Calendar event if coach has tokens
    if (session.coach.googleCalendarAccessToken) {
      try {
        const sessionDateTime = moment(session.scheduledTime);
        const sessionEndTime = moment(session.scheduledTime).add(
          session.duration,
          "minutes"
        );
        const studentUser = session.attendance[0]?.student?.user;
        if (!studentUser) {
          throw new BadRequestException("No student associated with this session");
        }

        const calendarResult = await SessionService.createGoogleCalendarEvent( // Use SessionService.
          session.coach,
          studentUser,
          sessionDateTime,
          sessionEndTime,
          session.duration
        );
        meetLink = calendarResult.meetLink;
        googleEventId = calendarResult.googleEventId; 
      } catch (error) {
        console.error("Error creating Google Calendar event:", error);
      }
    }

    const updatedSession = await prisma.$transaction(async (tx) => {
      // Re-check for conflicts inside the transaction to ensure atomicity
      await this.checkForConflictingSessions(
        session.coachId,
        sessionStartDate,
        sessionEndDate,
        session.duration,
        sessionId,
        tx
      );

      const studentData = session.attendance[0]?.student;
      if (studentData) {
        await this.checkStudentConflicts(
          studentData.id,
          sessionStartDate,
          sessionEndDate,
          session.duration,
          sessionId,
          tx
        );
      }

      const updated = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.SCHEDULED,
          meetLink,
          googleEventId,
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

      // Increment coach stats
      const studentId = updated.attendance[0]?.studentId;
      if (studentId) {
        // Check if it's the student's first scheduled/completed session with this coach
        const previousSessionsCount = await tx.session.count({
          where: {
            coachId: updated.coachId,
            status: {
              in: [SessionStatus.SCHEDULED, SessionStatus.COMPLETED],
            },
            attendance: {
              some: { studentId },
            },
            id: { not: sessionId },
          },
        });

        await tx.coach.update({
          where: { id: updated.coachId },
          data: {
            totalSessions: { increment: 1 },
            studentsCoached: previousSessionsCount === 0 ? { increment: 1 } : undefined,
          },
        });
      }

      return updated;
    }, { timeout: 15000 });

    // Send email notifications for approval
    const coach = updatedSession.coach;
    const studentForNotification = updatedSession.attendance[0]?.student;
    const sessionDateTime = moment(updatedSession.scheduledTime);

    if (studentForNotification) {
      await SessionService.sendSessionNotifications(
        coach,
        studentForNotification,
        sessionDateTime,
        updatedSession.duration,
        meetLink
      );
    }

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session approved successfully"
    );

  }

  static async rejectSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        coach: {
          include: { user: true },
        },
        attendance: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    if (session.status !== "REQUESTED") {
      throw new BadRequestException("Only requested sessions can be rejected");
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CANCELLED,
      },
    });

    // Send rejection email (optional, but good practice)
    // For now we'll just use the existing cancellation logic or a new one
    // TODO: Add specialized rejection email

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session rejected successfully"
    );

  }

  private static async verifyCoachAvailability(
    coach: any,
    sessionDateTime: moment.Moment,
    duration: number
  ) {
    if (!coach.availability) {
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
    duration: number,
    excludeSessionId?: string,
    tx?: any
  ) {
    const prismaClient = tx || prisma;
    const conflictingSessions = await prismaClient.session.findMany({
      where: {
        coachId: coachId,
        status: { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] },
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
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

  private static async checkStudentConflicts(
    studentId: string,
    sessionStartDate: Date,
    sessionEndDate: Date,
    duration: number,
    excludeSessionId?: string,
    tx?: any
  ) {
    const prismaClient = tx || prisma;
    const conflictingSessions = await prismaClient.session.findMany({
      where: {
        attendance: {
          some: {
            studentId: studentId,
          },
        },
        status: { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] },
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
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
        "You already have a session scheduled or requested at this time"
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
        whereClause.status = { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        whereClause.status = { in: [SessionStatus.COMPLETED, SessionStatus.CANCELLED] };
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
        whereClause.status = { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = { in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED] };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        whereClause.status = { in: [SessionStatus.COMPLETED, SessionStatus.CANCELLED] };
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

    if (session.status !== SessionStatus.SCHEDULED) {
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
    await this.checkForConflictingSessions(
      coach.id,
      sessionStartDate,
      sessionEndDate,
      session.duration,
      sessionId
    );

    if (student) {
      await this.checkStudentConflicts(
        student.id,
        sessionStartDate,
        sessionEndDate,
        session.duration,
        sessionId
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