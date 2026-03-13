import { NextRequest } from "next/server";
import { programService } from "../services/program.service";
import { BadRequestException } from "../utils/http-exception";

export class ProgramController {
  async createProgram(request: NextRequest) {
    const body = await request.json();
    const user = (request as unknown as any).user;
    return await programService.createProgram(user, body);
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
    return await programService.getRecommendedPrograms(user);
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
    return await programService.updateProgram(user, slug, body);
  }

  async deleteProgram(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    const user = (request as unknown as any).user;
    return await programService.deleteProgram(user, slug);
  }

  async submitProgram(request: NextRequest, programId: string) {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    return await programService.submitProgram(user, programId);
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
    return await programService.updateById(user, id, body);
  }

  async deleteById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    const user = (request as unknown as any).user;
    return await programService.deleteById(user, id);
  }
}

export const programController = new ProgramController();
