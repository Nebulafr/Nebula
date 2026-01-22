import { NextRequest } from "next/server";
import { EnrollmentStatus } from "@/generated/prisma";
import { enrollmentService } from "@/app/api/services/enrollment.service";
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from "@/app/api/utils/http-exception";
import { sendSuccess } from "@/app/api/utils/send-response";
import { createEnrollmentSchema, enrollmentProgressSchema } from "@/lib/validations";

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

    enrollmentProgressSchema.parse({ progress });

    const updatedEnrollment = await enrollmentService.updateEnrollmentProgress(
      enrollmentId,
      user?.student?.id!,
      progress
    );

    return sendSuccess(
      { enrollment: updatedEnrollment },
      "Enrollment progress updated successfully"
    );
  }

  async enrollInProgram(request: NextRequest, slug: string) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "STUDENT") {
      throw new ForbiddenException("Student access required");
    }

    const body = await request.json();
    
    const enrollmentData = createEnrollmentSchema.parse(body);

    const enrollmentResult = await enrollmentService.enrollInProgram(
      user?.student?.id!,
      slug,
      enrollmentData
    );

    return sendSuccess(
      {
        enrollmentId: enrollmentResult.enrollmentId,
        programId: enrollmentResult.programId,
      },
      "Successfully enrolled in program",
      201
    );
  }
}