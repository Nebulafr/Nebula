import { NextRequest, NextResponse } from "next/server";
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

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> }
    ) => {
      const body = await request.json();
      const { slug } = await context.params;
      const user = (request as any).user;

      if (user.role !== "STUDENT") {
        throw new UnauthorizedException("Student access required");
      }

      const payload = bookSessionSchema.parse({ ...body, slug });
      const { date, startTime, duration = 60 } = payload;

      const coach = await prisma.coach.findUnique({
        where: {
          slug: slug,
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

      const sessionDateTime = new Date(`${date}T${startTime}`);
      const sessionEndTime = new Date(
        sessionDateTime.getTime() + duration * 60000
      );

      const conflictingSessions = await prisma.session.findMany({
        where: {
          coachId: coach.id,
          status: "SCHEDULED",
          OR: [
            {
              AND: [
                { scheduledTime: { lte: sessionDateTime } },
                {
                  scheduledTime: {
                    gte: new Date(sessionDateTime.getTime() - 60000 * duration),
                  },
                },
              ],
            },
            {
              AND: [
                { scheduledTime: { gte: sessionDateTime } },
                { scheduledTime: { lt: sessionEndTime } },
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
            programId: "",
            scheduledTime: sessionDateTime,
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
