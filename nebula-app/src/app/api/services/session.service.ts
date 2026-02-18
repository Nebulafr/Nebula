import { prisma } from "@/lib/prisma";
import { PaymentStatus, SessionStatus } from "@/generated/prisma";
import { createCalendarEvent } from "@/lib/google-api";
import { emailService } from "./email.service";
import { paymentService } from "./payment.service";
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
  async validateBooking(data: {
    coachId: string;
    studentUserId: string;
    scheduledTime: Date;
    duration: number;
    timezone?: string;
  }) {
    const { coachId, studentUserId, scheduledTime, duration, timezone: providedTimezone } = data;

    const coach = await prisma.coach.findUnique({
      where: {
        id: coachId,
        isActive: true, // Ensure coach is active
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
      throw new NotFoundException("Coach not found or inactive");
    }

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
        "Please complete your student profile to book sessions",
      );
    }

    const sessionStartDate = scheduledTime;
    const timezone = providedTimezone || student.timeZone || "UTC";
    const sessionDateTime = moment(sessionStartDate).tz(timezone);

    // Validate sessionDateTime validity
    if (!sessionDateTime.isValid()) {
      throw new BadRequestException("Invalid session date or time");
    }

    const sessionEndTime = sessionDateTime.clone().add(duration, "minutes");
    const sessionEndDate = sessionEndTime.toDate();

    // Check availability
    await this.verifyCoachAvailability(coach, sessionDateTime, duration);

    // Check conflicts
    await this.checkForConflictingSessions(
      coach.id,
      sessionStartDate,
      sessionEndDate,
      duration,
    );

    await this.checkStudentConflicts(
      student.id,
      sessionStartDate,
      sessionEndDate,
      duration,
    );

    return { coach, student, sessionStartDate, sessionEndDate, sessionDateTime, sessionEndTime };
  }

  async completeSessionCheckout(data: {
    coachId: string;
    studentUserId: string;
    scheduledTime: Date;
    duration: number;
    stripeSessionId: string;
    timezone?: string;
  }) {
    const { coachId, studentUserId, scheduledTime, duration, stripeSessionId, timezone } = data;

    const { coach, student, sessionDateTime, sessionEndTime } = await this.validateBooking({
      coachId,
      studentUserId,
      scheduledTime,
      duration,
      timezone
    });

    let meetLink = null;
    let googleEventId = null;

    if (coach.googleCalendarAccessToken) {
      try {
        const calendarResult = await this.createGoogleCalendarEvent(
          coach,
          student.user,
          sessionDateTime,
          sessionEndTime,
          duration
        );
        meetLink = calendarResult.meetLink;
        googleEventId = calendarResult.googleEventId;
      } catch (error) {
        console.error("Error creating Google Calendar event:", error);
      }
    }

    const session = await prisma.session.create({
      data: {
        coachId,
        scheduledTime,
        duration,
        title: `1-on-1 Session with ${coach.user.fullName} and ${student.user.fullName}`,
        description: `1-on-1 Session between ${coach.user.fullName} and ${student.user.fullName}`,
        status: SessionStatus.SCHEDULED,
        paymentStatus: PaymentStatus.PAID,
        stripeSessionId,
        meetLink,
        googleEventId,
        attendance: {
          create: {
            studentId: student.id,
          }
        }
      },
      include: {
        coach: { include: { user: true } },
        attendance: { include: { student: { include: { user: true } } } }
      }
    });

    await this.updateCoachStats(coach.id, student.id, session.id);

    await this.sendSessionNotifications(
      coach,
      student,
      sessionDateTime,
      duration,
      meetLink
    );

    return session;
  }

  private async updateCoachStats(coachId: string, studentId: string, currentSessionId: string) {
    const previousSessionsCount = await prisma.session.count({
      where: {
        coachId: coachId,
        status: {
          in: [SessionStatus.SCHEDULED, SessionStatus.COMPLETED],
        },
        attendance: {
          some: { studentId },
        },
        id: { not: currentSessionId },
      },
    });

    await prisma.coach.update({
      where: { id: coachId },
      data: {
        totalSessions: { increment: 1 },
        studentsCoached:
          previousSessionsCount === 0 ? { increment: 1 } : undefined,
      },
    });
  }

  async bookSession(data: BookSessionData) {
    const {
      coachId,
      date,
      startTime,
      duration = 60,
      studentUserId,
      timezone: providedTimezone,
    } = data;

    // Helper to construct Date from date+time+timezone
    // We need to fetch student's timezone if not provided, which validateBooking does internally via student fetch?
    // Actually validateBooking expects a Date object.

    // We need to fetch student to get timezone if not provided, OR we can rely on client passing it.
    // To match previous logic exactly is hard without fetching student first.
    // But validateBooking fetches student.

    // Let's do a pre-fetch just for timezone parsing if needed, or duplicate the date parsing logic.
    // Previous logic fetched student inside transaction.

    let timezone = providedTimezone || "UTC";
    if (!providedTimezone) {
      const student = await prisma.student.findUnique({ where: { userId: studentUserId }, select: { timeZone: true } });
      if (student && student.timeZone) {
        timezone = student.timeZone;
      }
    }

    const datePart = date.includes("T") ? date.split("T")[0] : date;
    const sessionDateTime = moment.tz(
      `${datePart} ${startTime}`,
      "YYYY-MM-DD HH:mm",
      timezone,
    );

    if (!sessionDateTime.isValid()) {
      throw new BadRequestException("Invalid session date or time format");
    }

    const scheduledTime = sessionDateTime.toDate();

    const { coach, student } = await this.validateBooking({
      coachId,
      studentUserId,
      scheduledTime,
      duration,
      timezone: providedTimezone
    });

    // Create session (Original behavior: REQUESTED, not PAID)
    const session = await prisma.session.create({
      data: {
        coachId,
        scheduledTime,
        duration,
        status: SessionStatus.REQUESTED,
        attendance: {
          create: {
            studentId: student.id,
          },
        },
      },
      include: {
        coach: { include: { user: true } },
        attendance: { include: { student: { include: { user: true } } } }
      }
    });

    await this.sendSessionNotifications(
      coach,
      student,
      sessionDateTime,
      duration,
      null,
    );

    return sendSuccess(
      { session: this.transformSession(session) },
      "Session booked successfully",
    );
  }

  async approveSession(sessionId: string) {
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

    if (session.coach.googleCalendarAccessToken) {
      try {
        const sessionDateTime = moment(session.scheduledTime);
        const sessionEndTime = moment(session.scheduledTime).add(
          session.duration,
          "minutes",
        );
        const studentUser = session.attendance[0]?.student?.user;
        if (!studentUser) {
          throw new BadRequestException(
            "No student associated with this session",
          );
        }

        const calendarResult = await this.createGoogleCalendarEvent(
          session.coach,
          studentUser,
          sessionDateTime,
          sessionEndTime,
          session.duration,
        );
        meetLink = calendarResult.meetLink;
        googleEventId = calendarResult.googleEventId;
      } catch (error) {
        console.error("Error creating Google Calendar event:", error);
      }
    }

    const updatedSession = await prisma.$transaction(
      async (tx) => {
        await this.checkForConflictingSessions(
          session.coachId,
          sessionStartDate,
          sessionEndDate,
          session.duration,
          sessionId,
          tx,
        );

        const studentData = session.attendance[0]?.student;
        if (studentData) {
          await this.checkStudentConflicts(
            studentData.id,
            sessionStartDate,
            sessionEndDate,
            session.duration,
            sessionId,
            tx,
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

        const studentId = updated.attendance[0]?.studentId;
        if (studentId) {
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
              studentsCoached:
                previousSessionsCount === 0 ? { increment: 1 } : undefined,
            },
          });
        }

        return updated;
      },
      { timeout: 15000 },
    );

    const coach = updatedSession.coach;
    const studentForNotification = updatedSession.attendance[0]?.student;
    const sessionDateTime = moment(updatedSession.scheduledTime);

    if (studentForNotification) {
      await this.sendSessionNotifications(
        coach,
        studentForNotification,
        sessionDateTime,
        updatedSession.duration,
        meetLink,
      );
    }

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session approved successfully",
    );
  }

  async rejectSession(sessionId: string) {
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

    if (session.paymentStatus === PaymentStatus.PAID && session.stripeSessionId) {
      await paymentService.processRefund("SESSION", sessionId);

      // Fetch updated session
      const updatedSession = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          coach: { include: { user: true } },
          attendance: { include: { student: { include: { user: true } } } }
        }
      });

      return sendSuccess(
        { session: this.transformSession(updatedSession) },
        "Session rejected and refunded successfully",
      );
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
      "Session rejected successfully",
    );
  }

  private async verifyCoachAvailability(
    coach: any,
    sessionDateTime: moment.Moment,
    duration: number,
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

      const [startHour, startMinute] = dayAvail.startTime
        .split(":")
        .map(Number);
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
            .format("HH:mm")} is outside of coach's available hours (${dayAvail.startTime
          } - ${dayAvail.endTime})`,
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

  private async checkForConflictingSessions(
    coachId: string,
    sessionStartDate: Date,
    sessionEndDate: Date,
    duration: number,
    excludeSessionId?: string,
    tx?: any,
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
                  gte: new Date(sessionStartDate.getTime() - 60000 * duration),
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
        "This time slot conflicts with an existing session",
      );
    }
  }

  private async checkStudentConflicts(
    studentId: string,
    sessionStartDate: Date,
    sessionEndDate: Date,
    duration: number,
    excludeSessionId?: string,
    tx?: any,
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
                  gte: new Date(sessionStartDate.getTime() - 60000 * duration),
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
        "You already have a session scheduled or requested at this time",
      );
    }
  }

  private async createGoogleCalendarEvent(
    coach: any,
    student: any,
    sessionDateTime: moment.Moment,
    sessionEndTime: moment.Moment,
    duration: number,
  ) {
    const eventTitle = `Coaching Session with ${student.user?.fullName || "Student"}`;
    const eventDescription = `Coaching session between ${coach.user?.fullName} and ${student.user?.fullName}`;
    const startTimeISO = sessionDateTime.utc().toISOString();
    const endTimeISO = sessionEndTime.utc().toISOString();
    const attendees = [coach.user?.email, student.user?.email].filter(
      Boolean,
    ) as string[];

    const calendarEvent = await createCalendarEvent(
      eventTitle,
      eventDescription,
      startTimeISO,
      endTimeISO,
      attendees,
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken,
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

  private async sendSessionNotifications(
    coach: any,
    student: any,
    sessionDateTime: moment.Moment,
    duration: number,
    meetLink: string | null,
  ) {
    try {
      if (!emailService.validateConfiguration()) {
        console.warn(
          "Email configuration not set up, skipping email notifications",
        );
        return;
      }

      await emailService.sendSessionBookingEmails(
        coach.user?.email,
        student.user?.email,
        {
          studentName: student.user?.fullName || "Student",
          coachName: coach.user?.fullName || "Coach",
          sessionDate: sessionDateTime.toISOString(),
          duration,
          meetLink: meetLink || undefined,
        },
      );
    } catch (error) {
      console.error("Error sending session notification emails:", error);
      // Don't fail the booking if email sending fails
    }
  }

  async getCoachSessions(
    userId: string,
    filter: "today" | "upcoming" | "past" | "all" = "upcoming",
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
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        whereClause.scheduledTime = {
          gte: startOfToday,
          lt: endOfToday,
        };
        whereClause.status = {
          in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED],
        };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = {
          in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED],
        };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        whereClause.status = {
          in: [SessionStatus.COMPLETED, SessionStatus.CANCELLED],
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
      "Sessions retrieved successfully",
    );
  }

  async getStudentSessions(
    userId: string,
    filter: "today" | "upcoming" | "past" | "all" = "upcoming",
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
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        whereClause.scheduledTime = {
          gte: startOfToday,
          lt: endOfToday,
        };
        whereClause.status = {
          in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED],
        };
        break;
      case "upcoming":
        whereClause.scheduledTime = {
          gte: now,
        };
        whereClause.status = {
          in: [SessionStatus.SCHEDULED, SessionStatus.REQUESTED],
        };
        break;
      case "past":
        whereClause.scheduledTime = {
          lt: now,
        };
        whereClause.status = {
          in: [SessionStatus.COMPLETED, SessionStatus.CANCELLED],
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
      "Sessions retrieved successfully",
    );
  }

  async updateSession(
    sessionId: string,
    updateData: any,
    userId: string,
    userRole: string,
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
      throw new BadRequestException(
        "You don't have permission to update this session",
      );
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
      "Session updated successfully",
    );
  }

  async cancelSession(
    sessionId: string,
    userId: string,
    userRole: string,
    reason?: string,
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
      throw new BadRequestException(
        "You don't have permission to cancel this session",
      );
    }

    if (session.status === "CANCELLED") {
      throw new BadRequestException("Session is already cancelled");
    }

    let cancelledSession;

    if (session.paymentStatus === PaymentStatus.PAID && session.stripeSessionId) {
      await paymentService.processRefund("SESSION", sessionId);
      cancelledSession = await prisma.session.findUnique({
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
      if (!cancelledSession) throw new NotFoundException("Session not found after refund");
    } else {
      cancelledSession = await prisma.session.update({
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
    }

    if (session.googleEventId && session.coach.googleCalendarAccessToken) {
      try {
        await this.deleteGoogleCalendarEvent(
          session.coach,
          session.googleEventId,
        );
      } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
      }
    }

    // Send email notifications
    const student = session.attendance[0]?.student;
    if (session.coach.user?.email && student?.user?.email) {
      await emailService.sendSessionCancelledEmails(
        session.coach.user.email,
        student.user.email,
        {
          studentName: student.user.fullName || "Student",
          coachName: session.coach.user.fullName || "Coach",
          sessionDate: session.scheduledTime.toISOString(),
          duration: session.duration,
          reason,
          cancelledBy:
            userRole === "COACH"
              ? session.coach.user.fullName || "Coach"
              : student.user.fullName || "Student",
        },
      );
    }

    return sendSuccess(
      { session: this.transformSession(cancelledSession) },
      "Session cancelled successfully",
    );
  }

  private async deleteGoogleCalendarEvent(coach: any, eventId: string) {
    const { deleteCalendarEvent } = await import("@/lib/google-api");
    const result = await deleteCalendarEvent(
      eventId,
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken,
    );

    if (result.newAccessToken) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { googleCalendarAccessToken: result.newAccessToken },
      });
    }
  }

  private transformSessions(sessions: any[]) {
    return sessions.map((session) => this.transformSession(session));
  }

  async rescheduleSession({
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
        "You don't have permission to reschedule this session",
      );
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot reschedule a session that is ${session.status.toLowerCase()}`,
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
      timezone,
    );
    const sessionEndTime = sessionDateTime
      .clone()
      .add(session.duration, "minutes");
    const sessionStartDate = sessionDateTime.toDate();
    const sessionEndDate = sessionEndTime.toDate();

    // Check for availability
    await this.verifyCoachAvailability(coach, sessionDateTime, session.duration);

    // Check for conflicts
    await this.checkForConflictingSessions(
      coach.id,
      sessionStartDate,
      sessionEndDate,
      session.duration,
      sessionId,
    );

    if (student) {
      await this.checkStudentConflicts(
        student.id,
        sessionStartDate,
        sessionEndDate,
        session.duration,
        sessionId,
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
          sessionEndTime,
        );
      } catch (error) {
        console.error("Error updating Google Calendar event:", error);
      }
    }

    // Send email notifications
    if (updatedSession.coach.user?.email && student?.user?.email) {
      await emailService.sendSessionRescheduledEmails(
        updatedSession.coach.user.email,
        student.user.email,
        {
          studentName: student.user.fullName || "Student",
          coachName: updatedSession.coach.user.fullName || "Coach",
          sessionDate: sessionStartDate.toISOString(),
          oldDate: session.scheduledTime.toISOString(),
          duration: session.duration,
          rescheduledBy:
            userRole === "COACH"
              ? updatedSession.coach.user.fullName || "Coach"
              : student.user.fullName || "Student",
          meetLink: session.meetLink || undefined,
        },
      );
    }

    return sendSuccess(
      { session: this.transformSession(updatedSession) },
      "Session rescheduled successfully",
    );
  }

  private async updateGoogleCalendarEvent(
    coach: any,
    eventId: string,
    startTime: moment.Moment,
    endTime: moment.Moment,
  ) {
    const { updateCalendarEvent } = await import("@/lib/google-api");
    const result = await updateCalendarEvent(
      eventId,
      startTime.toISOString(),
      endTime.toISOString(),
      coach.googleCalendarAccessToken,
      coach.googleCalendarRefreshToken,
    );

    if (result.newAccessToken) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { googleCalendarAccessToken: result.newAccessToken },
      });
    }
  }

  private transformSession(session: any) {
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

export const sessionService = new SessionService();