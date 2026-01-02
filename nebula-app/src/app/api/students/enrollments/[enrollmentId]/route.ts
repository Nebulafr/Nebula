import { NextRequest } from "next/server";
import { EnrollmentController } from "@/app/api/controllers/enrollment.controller";
import CatchError from "@/app/api/utils/catch-error";
import { requireStudent } from "@/app/api/middleware/auth";

const enrollmentController = new EnrollmentController();

export const PATCH = CatchError(
  requireStudent(
    async (
      req: NextRequest,
      context: { params: Promise<{ enrollmentId: string }> }
    ) => await enrollmentController.updateEnrollmentProgress(req, context)
  )
);
