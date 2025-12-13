import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "../services/admin.service";
import {
  adminProgramQuerySchema,
  programActionSchema,
} from "@/lib/validations";

export class AdminController {
  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const payload = adminProgramQuerySchema.parse(queryParams);
    const programs = await AdminService.getPrograms(payload);

    console.log({ programs });

    return NextResponse.json(
      {
        success: true,
        data: { programs },
        message: "Programs fetched successfully",
      },
      { status: 200 }
    );
  }

  async updateProgramStatus(request: NextRequest, programId: string) {
    const body = await request.json();
    const payload = programActionSchema.parse(body);

    const result = await AdminService.updateProgramStatus(programId, payload);

    return NextResponse.json(
      {
        success: result.success,
        data: { program: result.program },
        message: result.message,
      },
      { status: 200 }
    );
  }

  async getUsers(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
    };

    return await AdminService.getUsers(queryParams);
  }

  async getReviews(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      targetType: searchParams.get("targetType") || undefined,
      status: searchParams.get("status") || undefined,
      rating: searchParams.get("rating") || undefined,
    };

    return await AdminService.getReviews(queryParams);
  }
}
