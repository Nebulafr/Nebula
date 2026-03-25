import { NextRequest } from "next/server";
import { adminService } from "../services/admin.service";
import {
  adminProgramQuerySchema,
  programActionSchema,
  adminCreateUserSchema,
} from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";
import { reviewService } from "../services/review.service";
import { prisma } from "@/lib/providers";
import { sendSuccess } from "../utils/send-response";

export class AdminController {
  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const payload = adminProgramQuerySchema.parse(queryParams);
    const result = await adminService.getPrograms(payload);
    return sendSuccess(result, "Programs fetched successfully");
  }

  async updateProgramStatus(request: NextRequest, programId: string) {
    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    const body = await request.json();
    const payload = programActionSchema.parse(body);

    const result = await adminService.updateProgramStatus(programId, payload);
    return sendSuccess(result, "Program status updated successfully");
  }

  async getUsers(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminUserQuerySchema } = await import("@/lib/validations");
    const payload = adminUserQuerySchema.parse(queryParams);
    const result = await adminService.getUsers(payload);
    return sendSuccess(result, "Users fetched successfully");
  }

  async getReviews(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      targetType: searchParams.get("targetType") || undefined,
      status: searchParams.get("status") || undefined,
      rating: searchParams.get("rating") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminReviewQuerySchema } = await import("@/lib/validations");
    const payload = adminReviewQuerySchema.parse(queryParams);
    const result = await adminService.getReviews(payload);
    return sendSuccess(result, "Reviews fetched successfully");
  }

  async getDashboardStats() {
    const result = await adminService.getDashboardStats();
    return sendSuccess(result, "Dashboard stats fetched successfully");
  }

  async getRecentSignups(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    const result = await adminService.getRecentSignups(limit);
    return sendSuccess(result, "Recent signups fetched successfully");
  }

  async getPlatformActivity(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await adminService.getPlatformActivity(limit);
    return sendSuccess(result, "Platform activity fetched successfully");
  }

  async getEvents(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminEventQuerySchema } = await import("@/lib/validations");
    const payload = adminEventQuerySchema.parse(queryParams);
    const result = await adminService.getEvents(payload);
    return sendSuccess(result, "Events fetched successfully");
  }

  async updateCohort(request: NextRequest, cohortId: string) {
    if (!cohortId) {
      throw new BadRequestException("Cohort ID is required");
    }

    const body = await request.json();
    const result = await adminService.updateCohort(cohortId, body);
    return sendSuccess(result, "Cohort updated successfully");
  }

  async getCohortsByProgram(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    const result = await adminService.getCohortsByProgram(programId);
    return sendSuccess(result, "Cohorts fetched successfully");
  }

  async createCohort(request: NextRequest) {
    const body = await request.json();
    const { programId, name, startDate, maxStudents } = body;

    if (!programId) {
      throw new BadRequestException("Program ID is required");
    }

    const result = await adminService.createCohort(programId, {
      name,
      startDate,
      maxStudents,
    });
    return sendSuccess(result, "Cohort created successfully", 201);
  }

  async deleteReview(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Review ID is required");
    }

    const { searchParams } = new URL(request.url);
    let targetType = searchParams.get("targetType");

    if (!targetType) {
      // Try to resolve targetType from database
      const coachReview = await prisma.coachReview.findUnique({ where: { id } });
      if (coachReview) {
        targetType = "COACH";
      } else {
        const programReview = await prisma.programReview.findUnique({ where: { id } });
        if (programReview) {
          targetType = "PROGRAM";
        }
      }
    }

    if (targetType === "COACH") {
      const result = await reviewService.deleteCoachReview(id);
      return sendSuccess(result, "Review deleted successfully");
    } else if (targetType === "PROGRAM") {
      const result = await reviewService.deleteProgramReview(id);
      return sendSuccess(result, "Review deleted successfully");
    } else {
      throw new BadRequestException("Could not determine review type");
    }
  }

  async getTransactions(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      sourceType: searchParams.get("sourceType") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const { adminTransactionQuerySchema } = await import("@/lib/validations");
    const payload = adminTransactionQuerySchema.parse(queryParams);
    const result = await adminService.getTransactions(payload);
    return sendSuccess(result, "Transactions fetched successfully");
  }

  async deleteUser(request: NextRequest, userId: string) {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    const result = await adminService.deleteUser(userId);
    return sendSuccess(result, "User deleted successfully");
  }

  async createUser(request: NextRequest) {
    const body = await request.json();
    const payload = adminCreateUserSchema.parse(body);

    const result = await adminService.createUser(payload);
    return sendSuccess(result, "User created successfully", 201);
  }
}

export const adminController = new AdminController();
