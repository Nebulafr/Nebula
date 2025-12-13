import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middleware/auth";
import CatchError from "../../../utils/catch-error";
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "../../../utils/http-exception";
import { prisma } from "@/lib/prisma";
import { sendSuccess } from "../../../utils/send-response";
import { createEnrollmentSchema } from "@/lib/validations";

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

      const { coachId, time, date } = createEnrollmentSchema.parse(body);

      const program = await prisma.program.findUnique({
        where: {
          slug: slug,
          isActive: true,
        },
      });

      if (!program) {
        throw new NotFoundException("Program not found");
      }

      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        throw new BadRequestException(
          "Please complete your student profile to enroll"
        );
      }

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          programId: program.id,
        },
      });

      if (existingEnrollment) {
        throw new BadRequestException(
          "You are already enrolled in this program"
        );
      }

      if (
        program.maxStudents &&
        (program.currentEnrollments || 0) >= program.maxStudents
      ) {
        throw new BadRequestException(
          "This program has reached its maximum enrollment capacity"
        );
      }

      const enrollmentResult = await prisma.$transaction(async (prisma) => {
        const enrollment = await prisma.enrollment.create({
          data: {
            programId: program.id,
            coachId: coachId,
            studentId: student.id,
            time: time,
            enrollmentDate: new Date(
              date || new Date().toISOString().split("T")[0]
            ),
            status: "ACTIVE",
          },
        });

        await prisma.program.update({
          where: { id: program.id },
          data: {
            currentEnrollments: { increment: 1 },
          },
        });

        return {
          enrollmentId: enrollment.id,
          programId: program.id,
        };
      });

      return sendSuccess(
        {
          enrollmentId: enrollmentResult.enrollmentId,
          programId: enrollmentResult.programId,
        },
        "Successfully enrolled in program",
        201
      );
    }
  )
);
