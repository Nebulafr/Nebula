import { NextRequest } from "next/server";
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "../utils/http-exception";
import { createProgramSchema, updateProgramSchema } from "../utils/schemas";
import { prisma } from "@/lib/prisma";
import sendResponse from "../utils/send-response";

export class ProgramService {
  async createProgram(request: NextRequest) {
    const body = await request.json();
    const user = (request as any).user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const {
      title,
      category,
      description,
      objectives,
      modules,
      price,
      duration,
      difficultyLevel,
      maxStudents,
      tags,
      prerequisites,
    } = createProgramSchema.parse(body);

    const coachId = user.coach.id;
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      throw new BadRequestException(`Category "${category}" not found`);
    }

    const program = await prisma.program.create({
      data: {
        title,
        categoryId: categoryRecord.id,
        description,
        objectives,
        coachId: coachId,
        slug,
        rating: 0,
        totalReviews: 0,
        price: price || 0,
        duration: duration || "4 weeks",
        difficultyLevel: difficultyLevel || "BEGINNER",
        maxStudents: maxStudents || 100,
        currentEnrollments: 0,
        isActive: false,
        status: "INACTIVE",
        tags: tags || [],
        prerequisites: prerequisites || [],
        modules: {
          create:
            modules?.map((module: any, index: number) => ({
              title: module.title,
              week: module.week || index + 1,
              description: module.description,
            })) || [],
        },
      },
      include: {
        category: true,
        coach: true,
        modules: true,
      },
    });

    return sendResponse.success(
      {
        programId: program.id,
        program: program,
      },
      "Program created successfully",
      201
    );
  }

  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const coachId = searchParams.get("coachId") || undefined;
    const category = searchParams.get("category") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 10;

    const whereClause: any = {
      isActive: coachId ? false : true,
    };

    if (coachId) {
      whereClause.coachId = coachId;
    }

    if (category) {
      whereClause.category = {
        name: category,
      };
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        category: true,
        coach: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        enrollments: {
          select: {
            student: {
              select: {
                user: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        modules: true,
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
      take: limit,
    });

    console.log({ programs });

    const transformedPrograms = programs.map((program) => ({
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
      attendees: program.enrollments.map((e) => e.student.user.avatarUrl),
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      // Related data (included)
      category: program.category,
      coach: program.coach,
      enrollments: program.enrollments,
      modules: program.modules,
      _count: program._count,
    }));

    const groupedPrograms = transformedPrograms.reduce(
      (acc: Record<string, any[]>, program: any) => {
        const categoryName = program.category?.name || "General";
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(program);
        return acc;
      },
      {}
    );

    const formattedGroups = Object.entries(groupedPrograms).map(
      ([group, items]) => ({
        group,
        items,
      })
    );
    console.log({ formattedGroups });
    return sendResponse.success({
      programs: transformedPrograms,
      groupedPrograms: formattedGroups,
    });
  }

  async getBySlug(request: NextRequest, slug: string) {
    const program = await prisma.program.findUnique({
      where: { slug },
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
        modules: true,
        reviews: {
          include: {
            reviewer: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return sendResponse.success({ program });
  }

  async updateProgram(request: NextRequest, slug: string) {
    const body = await request.json();
    const user = (request as any).user;

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.id) {
      throw new UnauthorizedException(
        "You are not authorized to update this program"
      );
    }

    const {
      title,
      category,
      description,
      objectives,
      price,
      duration,
      difficultyLevel,
      maxStudents,
      tags,
      prerequisites,
      isActive,
      status,
    } = updateProgramSchema.parse(body);

    let categoryRecord;
    if (category) {
      categoryRecord = await prisma.category.findUnique({
        where: { name: category },
      });
      if (!categoryRecord) {
        throw new BadRequestException(`Category "${category}" not found`);
      }
    }

    const updatedProgram = await prisma.program.update({
      where: { slug },
      data: {
        title,
        categoryId: categoryRecord?.id,
        description,
        objectives,
        price,
        duration,
        difficultyLevel,
        maxStudents,
        tags,
        prerequisites,
        isActive,
        status,
        slug: title
          ? title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "")
          : undefined,
      },
    });

    return sendResponse.success({ program: updatedProgram });
  }

  async deleteProgram(request: NextRequest, slug: string) {
    const user = (request as any).user;

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.id) {
      throw new UnauthorizedException(
        "You are not authorized to delete this program"
      );
    }

    await prisma.program.delete({
      where: { slug },
    });

    return sendResponse.success(null, "Program deleted successfully");
  }
}
