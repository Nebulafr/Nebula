import { NextRequest } from "next/server";
import { enrollmentController } from "@/app/api/controllers/enrollment.controller";
import CatchError from "@/app/api/utils/catch-error";
import { requireStudent } from "@/app/api/middleware/auth";

export const GET = CatchError(
  requireStudent(
    async (req: NextRequest) =>
      await enrollmentController.getStudentEnrollments(req),
  ),
);