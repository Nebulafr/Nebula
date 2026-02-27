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
import { emailService } from "./email.service";
import { uploadService } from "./upload.service";
import { Program, Prisma, ProgramReview, User } from "@/generated/prisma";
import { AuthenticatedRequest } from "@/types";
type ProgramReviewWithUser = ProgramReview & { user?: User };
type ProgramWithRelations = Program & {
  modules?: any[];
  category?: any;
  coach?: any;
};

export class ProgramService {
  async createProgram(request: NextRequest) {
    const body = await request.json();
    const user = (request as unknown as AuthenticatedRequest)
      .user;

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
      coCoachIds: coCoachUserIds,
    } = createProgramSchema.parse(body);

    const coachId = user!.coach!.id;

    const slug = generateSlug(title);

    const categoryRecord = await prisma.category.findUnique({
      where: { id: category },
    });

    if (!categoryRecord) {
      throw new BadRequestException(`Category "${category}" not found`);
    }
    let validCoCoachIds: string[] = [];
    if (coCoachUserIds && coCoachUserIds.length > 0) {
      const validCoaches = await prisma.coach.findMany({
        where: {
          OR: [
            { id: { in: coCoachUserIds } },
            { userId: { in: coCoachUserIds } },
          ],
        },
        select: { id: true, userId: true },
      });

      const validCoachIds = validCoaches.map((c) => c.id);
      const validUserIds = validCoaches.map((c) => c.userId);
      validCoCoachIds = validCoachIds;

      const invalidIds = coCoachUserIds.filter(
        (id) => !validCoachIds.includes(id) && !validUserIds.includes(id),
      );
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
        targetAudience: targetAudience || [],
        modules: {
          create: await Promise.all(
            modules?.map(async (module, index) => {
              const materials = await Promise.all(
                (module.materials || []).map(async (mat, matIndex) => {
                  let url = mat.url;
                  // If it's a base64 string, upload it
                  if (url && url.startsWith("data:")) {
                    const result = await uploadService.uploadFile(url, {
                      folder: `nebula-materials`,
                    });
                    url = result.url;
                  }
                  return {
                    fileName: mat.name || "document",
                    url: url as string,
                    mimeType: mat.type || "application/pdf",
                    position: matIndex,
                  };
                }),
              );

              return {
                title: module.title,
                week: module.week || index + 1,
                description: module.description,
                materials: {
                  create: materials,
                },
              };
            }) || [],
          ),
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
        modules: {
          include: {
            materials: true,
          },
        },
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
      await emailService.sendProgramProposalEmail(
        program!.coach!.user!.email,
        "APPLICATION_RECEIVED",
        program!.coach!.user!.fullName || "Coach",
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

  transformProgramData(program: any) {
    return {
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
      attendees:
        program.enrollments?.map(
          (e: {
            student?: {
              user?: { avatarUrl?: string | null };
              avatarUrl?: string | null;
            };
          }) => e.student?.user?.avatarUrl || e.student?.avatarUrl || null,
        ) || [],
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      category: program.category,
      coach: program.coach,
      enrollments: program.enrollments,
      modules: program.modules,
      _count: program._count,
    };
  }

  private getProgramsWhereClause(searchParams: URLSearchParams) {
    const coachId = searchParams.get("coachId") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const whereClause: Prisma.ProgramWhereInput = {};

    if (coachId) {
      whereClause.coachId = coachId;
    } else {
      whereClause.isActive = true;
      whereClause.status = "ACTIVE";
    }

    if (category) {
      whereClause.category = {
        name: category,
      };
    }

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

    return whereClause;
  }

  private async fetchProgramsData(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam ? parseInt(limitParam) : 10;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    const whereClause = this.getProgramsWhereClause(searchParams);

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
          modules: {
            include: {
              materials: true,
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
        skip: offset,
        take: limit,
      }),
      prisma.program.count({ where: whereClause }),
    ]);

    const transformedPrograms = programs.map((program) =>
      this.transformProgramData(program),
    );

    return {
      transformedPrograms,
      totalCount,
      limit,
      offset,
    };
  }

  async getPrograms(request: NextRequest) {
    const { transformedPrograms, totalCount, limit, offset } =
      await this.fetchProgramsData(request);

    return sendSuccess({
      programs: transformedPrograms,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + transformedPrograms.length < totalCount,
      },
    });
  }

  async getGroupedPrograms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const whereClause = this.getProgramsWhereClause(searchParams);

    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const page = pageParam ? parseInt(pageParam) : 1;
    const skip = limit ? (page - 1) * limit : undefined;

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        programs: {
          some: whereClause,
        },
      },
      include: {
        programs: {
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
            modules: {
              include: {
                materials: true,
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
          take: limit,
          skip: skip,
        },
      },
    });

    const formattedGroups = categories.map((category) => ({
      categoryId: category.id,
      group: category.name,
      items: category.programs.map((program) =>
        this.transformProgramData(program),
      ),
    }));

    return sendSuccess({
      groupedPrograms: formattedGroups,
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
        modules: {
          include: {
            materials: true,
          },
        },
        reviews: {
          include: {
            user: true,
          },
        },
        cohorts: {
          where: {
            status: "UPCOMING",
            startDate: { gt: new Date() },
          },
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
      reviews: program.reviews.map((review) => ({
        ...review,
        content: review.comment,
        reviewer: (review as ProgramReviewWithUser).user,
      })),
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
          include: {
            materials: true,
          },
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
    const user = (request as unknown as AuthenticatedRequest)
      .user;

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

    if (program.coachId !== user!.coach!.id) {
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

    let categoryRecord: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
      isActive: boolean;
    } | null;
    if (category) {
      categoryRecord = await prisma.category.findUnique({
        where: { id: category },
      });
      if (!categoryRecord) {
        throw new BadRequestException(`Category "${category}" not found`);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Handle co-coaches
      if (coCoachIds !== undefined) {
        await tx.programCoach.deleteMany({
          where: { programId: program.id },
        });

        if (coCoachIds.length > 0) {
          const validCoaches = await tx.coach.findMany({
            where: { id: { in: coCoachIds } },
            select: { id: true },
          });

          const validCoachIds = validCoaches.map((c) => c.id);
          const invalidIds = coCoachIds.filter(
            (id: string) => !validCoachIds.includes(id),
          );

          if (invalidIds.length > 0) {
            throw new BadRequestException(
              `Invalid co-coach IDs: ${invalidIds.join(", ")}`,
            );
          }

          await tx.programCoach.createMany({
            data: validCoachIds.map((coachId) => ({
              programId: program.id,
              coachId,
            })),
          });
        }
      }

      // Handle modules update
      if (modules && modules.length > 0) {
        // Delete existing modules (materials will be deleted due to Cascade)
        await tx.module.deleteMany({
          where: { programId: program.id },
        });

        // Create new modules with materials
        for (const [index, mod] of modules.entries()) {
          const materials = await Promise.all(
            (mod.materials || []).map(
              async (
                mat: { url?: string; name?: string; type?: string },
                matIndex: number,
              ) => {
                let url = mat.url;
                if (url && url.startsWith("data:")) {
                  const result = await uploadService.uploadFile(url, {
                    folder: `nebula-materials`,
                  });
                  url = result.url;
                }
                return {
                  fileName: mat.name || "document",
                  url,
                  mimeType: mat.type || "application/pdf",
                  position: matIndex,
                };
              },
            ),
          );

          await tx.module.create({
            data: {
              programId: program.id,
              title: mod.title,
              week: mod.week || index + 1,
              description: mod.description,
              materials: {
                create: materials,
              },
            },
          });
        }
      }

      // Generate new slug if title changed
      let newSlug;
      if (title && title !== program.title) {
        newSlug = generateSlug(title);
      }

      return await tx.program.update({
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
            include: {
              materials: true,
            },
            orderBy: { week: "asc" },
          },
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
    });

    return sendSuccess({ program: result }, "Program updated successfully");
  }

  async checkUserReview(
    targetId: string,
    userId: string,
    targetType: "COACH" | "PROGRAM",
  ) {
    try {
      const existingReview =
        targetType === "COACH"
          ? await prisma.coachReview.findFirst({
            where: {
              userId,
              coachId: targetId,
            },
          })
          : await prisma.programReview.findFirst({
            where: {
              userId,
              programId: targetId,
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
    const user = (request as unknown as AuthenticatedRequest)
      .user;

    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    if (program.coachId !== user!.coach!.id) {
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

    let validCoCoachIds: string[] = [];
    if (coCoachIds && coCoachIds.length > 0) {
      const validCoaches = await prisma.coach.findMany({
        where: {
          OR: [{ id: { in: coCoachIds } }, { userId: { in: coCoachIds } }],
        },
        select: { id: true, userId: true },
      });
      validCoCoachIds = validCoaches.map((c) => c.id);
      const validUserIds = validCoaches.map((c) => c.userId);
      const invalidIds = coCoachIds.filter(
        (id) => !validCoCoachIds.includes(id) && !validUserIds.includes(id),
      );
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
    if (!slug) {
      throw new BadRequestException("Program Slug is required");
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

    return await this.performDeletion(request, program);
  }

  async deleteById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Program ID is required");
    }

    const program = await prisma.program.findUnique({
      where: { id },
    });

    return await this.performDeletion(request, program);
  }

  private async performDeletion(request: NextRequest, program: any) {
    const user = (request as unknown as AuthenticatedRequest)
      .user;

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    // Role-based security
    if (user.role === "COACH") {
      if (program.coachId !== user!.coach!.id) {
        throw new UnauthorizedException(
          "You are not authorized to delete this program",
        );
      }
    } else if (user.role !== "ADMIN") {
      throw new UnauthorizedException("Unauthorized access");
    }

    await prisma.program.delete({
      where: { id: program.id },
    });

    return sendSuccess(null, "Program deleted successfully");
  }

  async getRecommendedPrograms(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest)
      .user;

    if (!user.student) {
      throw new BadRequestException("User is not a student");
    }

    const interestedCategoryId = user.student.interestedCategoryId;

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
      modules: {
        include: {
          materials: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
    };

    let programs: ProgramWithRelations[] = [];

    if (interestedCategoryId) {
      programs = await prisma.program.findMany({
        where: {
          isActive: true,
          status: "ACTIVE",
          categoryId: interestedCategoryId,
        },
        include: includeOptions,
        orderBy: {
          rating: "desc",
        },
        take: 6,
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

    const transformedPrograms = programs.map((program) =>
      this.transformProgramData(program),
    );

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
          modules: {
            include: {
              materials: true,
            },
          },
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

    const transformedPrograms = programs.map((program) =>
      this.transformProgramData(program),
    );

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
    const user = (request as unknown as AuthenticatedRequest)
      .user;
    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || program.coachId !== user!.coach!.id) {
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
    const user = (request as unknown as AuthenticatedRequest)
      .user;
    if (user.role !== "COACH") {
      throw new UnauthorizedException("Coach access required");
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { program: true },
    });

    if (!cohort || cohort.program.coachId !== user!.coach!.id) {
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
    const user = (request as unknown as AuthenticatedRequest)
      .user;
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

    if (!cohort || cohort.program.coachId !== user!.coach!.id) {
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
    const user = (request as unknown as AuthenticatedRequest)
      .user;

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

    if (program.coachId !== user!.coach!.id) {
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

export const programService = new ProgramService();
