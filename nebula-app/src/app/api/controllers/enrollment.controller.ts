import { NextRequest } from "next/server";
import { EnrollmentStatus } from "@/generated/prisma";
import { enrollmentService } from "@/app/api/services/enrollment.service";
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ValidationException,
} from "@/app/api/utils/http-exception";
import { sendSuccess } from "@/app/api/utils/send-response";
import { z } from "zod";

export class EnrollmentController {
  async getStudentEnrollments(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Student access required");
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as EnrollmentStatus | null;

    const enrollments = await enrollmentService.getStudentEnrollments(
      user.studentId!,
      status || undefined
    );

    return sendSuccess(
      { enrollments },
      "Student enrollments retrieved successfully"
    );
  }

  async updateEnrollmentProgress(
    request: NextRequest,
    context: { params: Promise<{ enrollmentId: string }> }
  ) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Student access required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const { enrollmentId } = await context.params;
    const { progress } = body;

    // Validate progress value
    const progressSchema = z.object({
      progress: z.number().min(0).max(100),
    });

    try {
      progressSchema.parse({ progress });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Progress must be a number between 0 and 100`
        );
      }
      throw error;
    }

    const updatedEnrollment = await enrollmentService.updateEnrollmentProgress(
      enrollmentId,
      user.studentId!,
      progress
    );

    return sendSuccess(
      { enrollment: updatedEnrollment },
      "Enrollment progress updated successfully"
    );
  }
}