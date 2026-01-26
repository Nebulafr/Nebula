import { NextRequest } from "next/server";
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "../utils/http-exception";
import { createProgramSchema, updateProgramSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { sendSuccess } from "../utils/send-response";
import { generateSlug } from "@/lib/utils";
import { extractUserFromRequest } from "../utils/extract-user";
import { EmailService } from "./email.service";

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
      targetAudience,
      coCoachIds,
    } = createProgramSchema.parse(body);

    const coachId = user.coach.id;

    const slug = generateSlug(title);

    const categoryRecord = await prisma.category.findUnique({
      where: { id: category },
    });

    if (!categoryRecord) {
      throw new BadRequestException(`Category "${category}" not found`);
    }
    let validCoCoachIds: string[] = [];
    if (coCoachIds && coCoachIds.length > 0) {
      const validCoaches = await prisma.coach.findMany({
        where: { userId: { in: coCoachIds } },
        select: { id: true, userId: true },
      });
      const validCoachIds = validCoaches.map((c) => c.userId);
      validCoCoachIds = validCoaches.map((coach) => coach.id);
      const invalidIds = coCoachIds.filter((id) => !validCoachIds.includes(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Invalid co-coach IDs: ${invalidIds.join(", ")}`,
        );
      }
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
        status: "PENDING_APPROVAL",
        tags: tags || [],
        prerequisites: prerequisites || [],
        targetAudience: targetAudience || null,
        modules: {
          create:
            modules?.map((module: any, index: number) => ({
              title: module.title,
              week: module.week || index + 1,
              description: module.description,
              materials: module.materials || [],
            })) || [],
        },
        coCoaches:
          validCoCoachIds.length > 0
            ? {
                create: validCoCoachIds.map((coachId) => ({
                  coachId,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
        modules: true,
        coCoaches: {
          include: {
            coach: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Send APPLICATION_RECEIVED email to the coach
    try {
      await EmailService.sendProgramProposalEmail(
        program.coach.user.email,
        "APPLICATION_RECEIVED",
        program.coach.user.fullName || "Coach",
      );
    } catch (error) {
      console.error("Failed to send application received email:", error);
      // Don't fail the program creation if email fails
    }

    return sendSuccess(
      {
        programId: program.id,
        program: program,
      },
      "Program created successfully",
      201,
    );
  }

  async getPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const coachId = searchParams.get("coachId") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam ? parseInt(limitParam) : 10;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    const whereClause: any = {};

    if (coachId) {
      // When fetching by coachId, return all programs for that coach (any status)
      whereClause.coachId = coachId;
    } else {
      // For public listing, only show active programs
      whereClause.isActive = true;
      whereClause.status = "ACTIVE";
    }

    if (category) {
      whereClause.category = {
        name: category,
      };
    }

    // Add search filtering - search in title, description, category name, and coach name
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        {
          coach: {
            user: { fullName: { contains: search, mode: "insensitive" } },
          },
        },
        { tags: { has: search } },
      ];
    }

    const [programs, totalCount] = await Promise.all([
      prisma.program.findMany({
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
        skip: offset,
        take: limit,
      }),
      prisma.program.count({ where: whereClause }),
    ]);

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
      {},
    );

    const formattedGroups = Object.entries(groupedPrograms).map(
      ([group, items]) => ({
        group,
        items,
      }),
    );
    return sendSuccess({
      programs: transformedPrograms,
      groupedPrograms: formattedGroups,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + programs.length < totalCount,
      },
    });
  }

  async getBySlug(request: NextRequest, slug: string) {
    const user = await extractUserFromRequest(request);
    const userId = user?.id;

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
        cohorts: {
          orderBy: {
            startDate: "asc",
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    let hasUserReviewed = false;
    if (userId) {
      hasUserReviewed = await this.checkUserReview(
        program.id,
        userId,
        "PROGRAM",
      );
    }

    const transformedProgram = {
      ...program,
      hasUserReviewed,
    };

    return sendSuccess({ program: transformedProgram });
  }

  async getById(request: NextRequest, id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        category: true,
        coach: {
          include: {
            user: true,
          },
        },
        modules: {
          orderBy: { week: "asc" },
        },
        coCoaches: {
          include: {
            coach: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return sendSuccess({ program });
  }

  async updateById(request: NextRequest, id: string) {
    const body = await request.json();
    const user = (request as any).user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: { modules: true },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.coach.id) {
      throw new UnauthorizedException(
        "You are not authorized to update this program",
      );
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
      targetAudience,
      coCoachIds,
    } = body;

    let categoryRecord;
    if (category) {
      categoryRecord = await prisma.category.findUnique({
        where: { id: category },
      });
      if (!categoryRecord) {
        throw new BadRequestException(`Category "${category}" not found`);
      }
    }

    // Handle co-coaches
    if (coCoachIds !== undefined) {
      await prisma.programCoach.deleteMany({
        where: { programId: program.id },
      });

      if (coCoachIds.length > 0) {
        const validCoaches = await prisma.coach.findMany({
          where: { userId: { in: coCoachIds } },
          select: { id: true },
        });
        await prisma.programCoach.createMany({
          data: validCoaches.map((coach) => ({
            programId: program.id,
            coachId: coach.id,
          })),
        });
      }
    }

    // Handle modules update
    if (modules && modules.length > 0) {
      // Delete existing modules
      await prisma.module.deleteMany({
        where: { programId: program.id },
      });

      // Create new modules
      await prisma.module.createMany({
        data: modules.map((mod: any, index: number) => ({
          programId: program.id,
          title: mod.title,
          week: mod.week || index + 1,
          description: mod.description,
          materials: mod.materials || [],
        })),
      });
    }

    // Generate new slug if title changed
    let newSlug;
    if (title && title !== program.title) {
      newSlug = generateSlug(title);
    }

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        title,
        categoryId: categoryRecord?.id,
        description,
        objectives,
        price,
        duration: duration ? `${duration} weeks` : undefined,
        difficultyLevel,
        maxStudents,
        tags,
        prerequisites,
        targetAudience,
        slug: newSlug,
      },
      include: {
        category: true,
        coach: {
          include: { user: true },
        },
        modules: {
          orderBy: { week: "asc" },
        },
        coCoaches: {
          include: {
            coach: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess(
      { program: updatedProgram },
      "Program updated successfully",
    );
  }

  async checkUserReview(
    targetId: string,
    userId: string,
    targetType: "COACH" | "PROGRAM",
  ) {
    try {
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId: userId,
          targetType,
          ...(targetType === "COACH"
            ? { coachId: targetId }
            : { programId: targetId }),
        },
      });

      return !!existingReview;
    } catch (error) {
      console.error("Error checking user review:", error);
      return false;
    }
  }

  async updateProgram(request: NextRequest, slug: string) {
    const body = await request.json();
    const user = (request as any).user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.coach.id) {
      throw new UnauthorizedException(
        "You are not authorized to update this program",
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
      targetAudience,
      coCoachIds,
    } = updateProgramSchema.parse(body);

    let categoryRecord;
    if (category) {
      categoryRecord = await prisma.category.findUnique({
        where: { id: category },
      });
      if (!categoryRecord) {
        throw new BadRequestException(`Category "${category}" not found`);
      }
    }

    if (coCoachIds && coCoachIds.length > 0) {
      const validCoaches = await prisma.coach.findMany({
        where: { id: { in: coCoachIds } },
        select: { id: true },
      });
      const validCoachIds = validCoaches.map((c) => c.id);
      const invalidIds = coCoachIds.filter((id) => !validCoachIds.includes(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Invalid co-coach IDs: ${invalidIds.join(", ")}`,
        );
      }
    }
    let newSlug;
    if (title) {
      newSlug = generateSlug(title as string);
    }
    if (coCoachIds !== undefined) {
      await prisma.programCoach.deleteMany({
        where: { programId: program.id },
      });

      if (coCoachIds.length > 0) {
        await prisma.programCoach.createMany({
          data: coCoachIds.map((coachId) => ({
            programId: program.id,
            coachId,
          })),
        });
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
        targetAudience,
        slug: newSlug,
      },
      include: {
        coCoaches: {
          include: {
            coach: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess({ program: updatedProgram });
  }

  async deleteProgram(request: NextRequest, slug: string) {
    const user = (request as any).user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { slug },
      include: {
        enrollments: {
          where: {
            status: { in: ["ACTIVE", "PAUSED"] },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.coach.id) {
      throw new UnauthorizedException(
        "You are not authorized to delete this program",
      );
    }

    // Prevent deletion if there are active enrollments
    if (program.enrollments.length > 0) {
      throw new BadRequestException(
        `Cannot delete program with ${program.enrollments.length} active enrollment(s). Please cancel or complete all enrollments first.`,
      );
    }

    await prisma.program.delete({
      where: { slug },
    });

    return sendSuccess(null, "Program deleted successfully");
  }

  async getRecommendedPrograms(request: NextRequest) {
    const user = (request as any).user;

    if (!user.student) {
      throw new BadRequestException("User is not a student");
    }

    const interestedProgram = user.student.interestedProgram;

    const includeOptions = {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
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
    };

    let programs: any[] = [];

    if (interestedProgram) {
      programs = await prisma.program.findMany({
        where: {
          isActive: true,
          status: "ACTIVE",
          category: {
            name: interestedProgram,
          },
        },
        include: includeOptions,
        orderBy: [
          { rating: "desc" },
          { currentEnrollments: "desc" },
          { createdAt: "desc" },
        ],
        take: 3,
      });
    }

    if (programs.length < 3) {
      const remainingSlots = 3 - programs.length;
      const existingProgramIds = programs.map((p) => p.id);

      const additionalPrograms = await prisma.program.findMany({
        where: {
          isActive: true,
          status: "ACTIVE",
          id: { notIn: existingProgramIds },
        },
        include: includeOptions,
        orderBy: [{ rating: "desc" }, { currentEnrollments: "desc" }],
        take: remainingSlots,
      });

      programs = [...programs, ...additionalPrograms];
    }

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
      attendees: program.enrollments.map(
        (e: { student: { user: { avatarUrl: any } } }) =>
          e.student.user.avatarUrl,
      ),
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      category: program!.category!,
      coach: program.coach,
      enrollments: program.enrollments,
      modules: program.modules,
      _count: program._count,
    }));

    return sendSuccess({ programs: transformedPrograms });
  }

  async getPopularPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [programs, totalCount] = await Promise.all([
      prisma.program.findMany({
        where: {
          isActive: true,
          status: "ACTIVE",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
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
        orderBy: [
          {
            rating: "desc",
          },
          {
            totalReviews: "desc",
          },
          {
            currentEnrollments: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.program.count({
        where: {
          isActive: true,
          status: "ACTIVE",
        },
      }),
    ]);

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
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      category: program!.category!,
      coach: program.coach,
      enrollments: program.enrollments,
      modules: program.modules,
      _count: program._count,
    }));

    return sendSuccess(
      {
        programs: transformedPrograms,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + programs.length < totalCount,
        },
      },
      "Popular programs fetched successfully",
    );
  }

  // Cohort Management
  async getCohorts(programId: string) {
    const cohorts = await prisma.cohort.findMany({
      where: { programId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return sendSuccess({ cohorts });
  }

  async createCohort(request: NextRequest, programId: string) {
    const user = (request as any).user;
    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || program.coachId !== user.coach.id) {
      throw new UnauthorizedException(
        "Unauthorized to manage cohorts for this program",
      );
    }

    const body = await request.json();
    const { name, startDate, endDate, maxStudents } = body;

    const cohort = await prisma.cohort.create({
      data: {
        programId,
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxStudents: maxStudents || program.maxStudents,
        status: "UPCOMING",
      },
    });

    return sendSuccess({ cohort }, "Cohort created successfully", 201);
  }

  async updateCohort(request: NextRequest, cohortId: string) {
    const user = (request as any).user;
    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { program: true },
    });

    if (!cohort || cohort.program.coachId !== user.coach.id) {
      throw new UnauthorizedException("Unauthorized to update this cohort");
    }

    const body = await request.json();
    const { name, startDate, endDate, maxStudents, status } = body;

    const updatedCohort = await prisma.cohort.update({
      where: { id: cohortId },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxStudents,
        status,
      },
    });

    return sendSuccess(
      { cohort: updatedCohort },
      "Cohort updated successfully",
    );
  }

  async deleteCohort(request: NextRequest, cohortId: string) {
    const user = (request as any).user;
    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program: true,
        _count: { select: { enrollments: true } },
      },
    });

    if (!cohort || cohort.program.coachId !== user.coach.id) {
      throw new UnauthorizedException("Unauthorized to delete this cohort");
    }

    if (cohort._count.enrollments > 0) {
      throw new BadRequestException(
        "Cannot delete cohort with active enrollments",
      );
    }

    await prisma.cohort.delete({
      where: { id: cohortId },
    });

    return sendSuccess(null, "Cohort deleted successfully");
  }

  async submitProgram(request: NextRequest, programId: string) {
    const user = (request as any).user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        coach: {
          include: { user: true },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user.coach.id) {
      throw new UnauthorizedException(
        "You are not authorized to submit this program",
      );
    }

    if (program.status !== "APPROVED") {
      throw new BadRequestException(
        "Only approved programs can be submitted for publishing",
      );
    }

    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: {
        status: "SUBMITTED",
        updatedAt: new Date(),
      },
      include: {
        category: true,
        coach: {
          include: { user: true },
        },
      },
    });

    return sendSuccess(
      { program: updatedProgram },
      "Program submitted for publishing successfully",
    );
  }
}
