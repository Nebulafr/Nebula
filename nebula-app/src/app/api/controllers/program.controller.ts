import { NextRequest } from "next/server";
import { ProgramService } from "../services/program.service";
import { BadRequestException } from "../utils/http-exception";

const programService = new ProgramService();

export class ProgramController {
  async createProgram(request: NextRequest) {
    return await programService.createProgram(request);
  }

  async getPrograms(request: NextRequest) {
    return await programService.getPrograms(request);
  }

  async getGroupedPrograms(request: NextRequest) {
    return await programService.getGroupedPrograms(request);
  }

  async getRecommendedPrograms(request: NextRequest) {
    return await programService.getRecommendedPrograms(request);
  }

  async getPopularPrograms(request: NextRequest) {
    return await programService.getPopularPrograms(request);
  }

  async getBySlug(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    return await programService.getBySlug(request, slug);
  }

  async updateProgram(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    return await programService.updateProgram(request, slug);
  }

  async deleteProgram(request: NextRequest, slug: string) {
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
    }
    return await programService.deleteProgram(request, slug);
  }

  async submitProgram(request: NextRequest, programId: string) {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }
    return await programService.submitProgram(request, programId);
  }

  async getById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    return await programService.getById(request, id);
  }

  async updateById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    return await programService.updateById(request, id);
  }

  async deleteById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }
    return await programService.deleteById(request, id);
  }
}
