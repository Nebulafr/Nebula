import { NextRequest, NextResponse } from "next/server";
import { programService } from "../services/program.service";
import { BadRequestException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

export class ProgramController {
  async createProgram(request: NextRequest): Promise<NextResponse> {
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.createProgram(coachId, user.role, body);
    return sendSuccess(result, "Program created successfully", 201);
  }

  async getPrograms(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const params = {
      coachId: searchParams.get("coachId") || undefined,
      categoryId: searchParams.get("category") || searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };
    const result = await programService.getPrograms(params);
    return sendSuccess(result, "Programs fetched successfully");
  }

  async getGroupedPrograms(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const params = {
      coachId: searchParams.get("coachId") || undefined,
      categoryId: searchParams.get("category") || searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    };
    const result = await programService.getGroupedPrograms(params);
    return sendSuccess(result, "Programs grouped by category fetched successfully");
  }

  async getRecommendedPrograms(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as any).user;
    if (!user?.student) {
      throw new BadRequestException("User is not a student");
    }

    const interestedCategoryIds =
      user.student.interestedCategories?.map((ic: any) => ic.categoryId) || [];

    const result = await programService.getRecommendedPrograms(
      user.student.id,
      interestedCategoryIds,
    );
    return sendSuccess(result, "Recommended programs fetched successfully");
  }

  async getPopularPrograms(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };
    const result = await programService.getPopularPrograms(params);
    return sendSuccess(result, "Popular programs fetched successfully");
  }

  async getBySlug(request: NextRequest, slug: string): Promise<NextResponse> {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const { extractUserFromRequest } = await import("../utils/extract-user");
    const user = await extractUserFromRequest(request);
    const result = await programService.getBySlug(slug, user?.id);
    return sendSuccess(result, "Program fetched successfully");
  }

  async updateProgram(request: NextRequest, slug: string): Promise<NextResponse> {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.updateProgram(coachId, user.role, slug, body);
    return sendSuccess(result, "Program updated successfully");
  }

  async deleteProgram(request: NextRequest, slug: string): Promise<NextResponse> {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.deleteProgram(coachId, user.role, slug);
    return sendSuccess(result, "Program deleted successfully");
  }

  async submitProgram(request: NextRequest, programId: string): Promise<NextResponse> {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.submitProgram(coachId, user.role, programId);
    return sendSuccess(result, "Program submitted for review successfully");
  }

  async getById(request: NextRequest, id: string): Promise<NextResponse> {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const result = await programService.getById(id);
    return sendSuccess(result, "Program fetched successfully");
  }

  async updateById(request: NextRequest, id: string): Promise<NextResponse> {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.updateById(coachId, user.role, id, body);
    return sendSuccess(result, "Program updated successfully");
  }

  async deleteById(request: NextRequest, id: string): Promise<NextResponse> {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    const result = await programService.deleteById(coachId, user.role, id);
    return sendSuccess(result, "Program deleted successfully");
  }
}

export const programController = new ProgramController();
