import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { studentService } from "../services/student.service";
import { updateStudentSchema } from "@/lib/validations";

export class StudentController {
  async updateProfile(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    const body = await request.json();
    const payload = updateStudentSchema.parse(body);

    return await studentService.updateProfile(user.id, payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    return await studentService.getProfile(user.id);
  }
}

export const studentController = new StudentController();
