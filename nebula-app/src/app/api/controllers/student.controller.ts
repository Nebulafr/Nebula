import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { studentService } from "../services/student.service";
import { updateStudentSchema } from "@/lib/validations";
import { sendSuccess } from "../utils/send-response";

export class StudentController {
  async updateProfile(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    const body = await request.json();
    const payload = updateStudentSchema.parse(body);

    const result = await studentService.updateProfile(user.id, payload);
    return sendSuccess(result, "Student profile updated successfully");
  }

  async getProfile(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    const result = await studentService.getProfile(user.id);
    return sendSuccess(result, "Student profile fetched successfully");
  }
}

export const studentController = new StudentController();
