import { prisma } from "@/lib/prisma";
import { AdminProgramQueryData, ProgramActionData } from "../utils/schemas";
import { ProgramStatus } from "@/generated/prisma";
import sendResponse from "../utils/send-response";

export class AdminService {
  static async getPrograms(params: AdminProgramQueryData) {
    const { status, category, search } = params;

    // Build where clause for Prisma query
    const whereClause: any = {};

    // Apply status filter at database level
    if (status && status !== "all") {
      // Map frontend filter values to ProgramStatus enum
      if (status === "active") {
        whereClause.status = "ACTIVE";
      } else if (status === "inactive") {
        whereClause.status = "INACTIVE";
      } else {
        whereClause.status = status.toUpperCase(); // Fallback for any other values
      }
    }

    // Apply category filter at database level
    if (category && category !== "all") {
      whereClause.category = {
        name: category,
      };
    }

    // Apply search filter at database level
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          coach: {
            user: {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // Fetch programs with Prisma including related data
    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return exact Prisma structure with relations
    return programs.map((program) => ({
      // Exact Prisma Program model fields
      id: program.id,
      title: program.title,
      categoryId: program.categoryId,
      description: program.description,
      objectives: program.objectives,
      coachId: program.coachId,
      slug: program.slug,
      rating: program.rating,
      totalReviews: program.totalReviews,
      price: program.price,
      duration: program.duration,
      difficultyLevel: program.difficultyLevel,
      maxStudents: program.maxStudents,
      currentEnrollments: program.currentEnrollments,
      isActive: program.isActive,
      status: program.status,
      tags: program.tags,
      prerequisites: program.prerequisites,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      // Related data
      category: program.category,
      coach: program.coach,
      _count: program._count,
    }));
  }

  static async updateProgramStatus(programId: string, data: ProgramActionData) {
    const { action, reason } = data;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!program) {
      throw new Error("Program not found");
    }

    let status: ProgramStatus;
    let isActive: boolean;

    switch (action) {
      case "activate":
        status = "ACTIVE";
        isActive = true;
        break;
      case "deactivate":
        status = "INACTIVE";
        isActive = false;
        break;
      default:
        throw new Error("Invalid action");
    }

    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: {
        status: status,
        isActive: isActive,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
      },
    });

    // Log the action with reason if provided
    if (reason) {
      console.log(`Program ${programId} ${action}ed with reason: ${reason}`);
    }

    return {
      success: true,
      program: updatedProgram,
      message: `Program ${action}ed successfully`,
    };
  }

  static async getUsers(params?: { search?: string; role?: string; status?: string }) {
    const { search, role, status } = params || {};

    // Build where clause for Prisma query
    const whereClause: any = {
      role: {
        in: ["COACH", "STUDENT", "ADMIN"]
      }
    };

    // Apply role filter at database level
    if (role && role !== "all") {
      whereClause.role = role.toUpperCase();
    }

    // Apply status filter at database level
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    // Apply search filter at database level
    if (search) {
      whereClause.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { role: "asc" },
        { fullName: "asc" }
      ]
    });

    return sendResponse.success({ users }, "Users fetched successfully");
  }

  static async getReviews(params?: { search?: string; targetType?: string; status?: string; rating?: string }) {
    const { search, targetType, status, rating } = params || {};

    // Build where clause for Prisma query
    const whereClause: any = {};

    // Apply target type filter at database level
    if (targetType && targetType !== "all") {
      whereClause.targetType = targetType.toUpperCase();
    }

    // Apply visibility status filter at database level
    if (status && status !== "all") {
      if (status === "visible") {
        whereClause.isPublic = true;
      } else if (status === "hidden") {
        whereClause.isPublic = false;
      }
    }

    // Apply rating filter at database level
    if (rating && rating !== "all") {
      whereClause.rating = parseInt(rating);
    }

    // Apply search filter at database level
    if (search) {
      whereClause.OR = [
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          reviewer: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          reviewer: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          program: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendResponse.success({ reviews }, "Reviews fetched successfully");
  }
}
