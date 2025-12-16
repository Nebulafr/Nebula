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

  async getRecommendedPrograms(request: NextRequest) {
    return await programService.getRecommendedPrograms(request);
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
}
