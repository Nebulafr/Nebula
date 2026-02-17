import { NextRequest } from "next/server";
import { studentService } from "../services/student.service";
import { updateStudentSchema } from "@/lib/validations";
import { UnauthorizedException } from "../utils/http-exception";

export class StudentController {
  async updateProfile(request: NextRequest) {
    const user = (request as any).user;

    const body = await request.json();
    const payload = updateStudentSchema.parse(body);

    return await studentService.updateProfile(user.id, payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;

    return await studentService.getProfile(user.id);
  }
}

export const studentController = new StudentController();
