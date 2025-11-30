import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middleware/auth";
import { bookSessionSchema } from "../../../utils/schemas";
import CatchError from "../../../utils/catch-error";
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "../../../utils/http-exception";
import { prisma } from "@/lib/prisma";
import sendResponse from "../../../utils/send-response";
import moment from "moment-timezone";

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ coachId: string }> }
    ) => {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        throw new BadRequestException("Invalid JSON body");
      }
      
      const { coachId } = await context.params;
      const user = (request as any).user;
      console.log({ body, coachId });

      if (user.role !== "STUDENT") {
        throw new UnauthorizedException("Student access required");
      }

      const payload = bookSessionSchema.parse({
        ...body,
        coachId,
      });
      const { date, startTime, duration = 60 } = payload;

      const coach = await prisma.coach.findUnique({
        where: {
          id: coachId,
          isActive: true,
        },
      });

      if (!coach) {
        throw new NotFoundException("Coach not found");
      }

      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        throw new BadRequestException(
          "Please complete your student profile to book sessions"
        );
      }

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

      console.log({ sessionStartDate, sessionEndDate });

      const conflictingSessions = await prisma.session.findMany({
        where: {
          coachId: coach.id,
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

      const sessionResult = await prisma.$transaction(async (prisma) => {
        const session = await prisma.session.create({
          data: {
            coachId: coach.id,
            scheduledTime: sessionStartDate,
            duration: duration,
            status: "SCHEDULED",
            title: `Session with ${coach.fullName || "Coach"}`,
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

      return sendResponse.success(
        {
          sessionId: sessionResult.sessionId,
          coachId: coach.id,
          date,
          startTime,
          duration,
        },
        "Session booked successfully",
        201
      );
    }
  )
);
