import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../../middleware/auth";
import CatchError from "../../../../utils/catch-error";
import { EnrollmentController } from "../../../../controllers/enrollment.controller";

const enrollmentController = new EnrollmentController();

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> }
    ) => {
      const { slug } = await context.params;
      return await enrollmentController.enrollInProgram(request, slug);
    }
  )
);
