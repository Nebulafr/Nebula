import { NextRequest } from "next/server";
import { programService } from "../services/program.service";
import { BadRequestException } from "../utils/http-exception";

export class ProgramController {
  async createProgram(request: NextRequest) {
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.createProgram(coachId, user.role, body);
  }

  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = {
      coachId: searchParams.get("coachId") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };
    return await programService.getPrograms(params);
  }

  async getGroupedPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = {
      coachId: searchParams.get("coachId") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    };
    return await programService.getGroupedPrograms(params);
  }

  async getRecommendedPrograms(request: NextRequest) {
    const user = (request as unknown as any).user;
    if (!user?.student) {
      throw new BadRequestException("User is not a student");
    }
    return await programService.getRecommendedPrograms(user.student.id, user.student.interestedCategoryId);
  }

  async getPopularPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };
    return await programService.getPopularPrograms(params);
  }

  async getBySlug(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const { extractUserFromRequest } = await import("../utils/extract-user");
    const user = await extractUserFromRequest(request);
    return await programService.getBySlug(slug, user?.id);
  }

  async updateProgram(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.updateProgram(coachId, user.role, slug, body);
  }

  async deleteProgram(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.deleteProgram(coachId, user.role, slug);
  }

  async submitProgram(request: NextRequest, programId: string) {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.submitProgram(coachId, user.role, programId);
  }

  async getById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    return await programService.getById(id);
  }

  async updateById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const body = await request.json();
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.updateById(coachId, user.role, id, body);
  }

  async deleteById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    const coachId = user?.coach?.id;
    return await programService.deleteById(coachId, user.role, id);
  }
}

export const programController = new ProgramController();
