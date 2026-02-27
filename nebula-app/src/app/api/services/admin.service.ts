import { prisma } from "@/lib/prisma";
import {
  AdminEventQueryData,
  AdminProgramQueryData,
  AdminReviewQueryData,
  AdminUserQueryData,
  ProgramActionData,
} from "@/lib/validations";
import {
  Prisma,
  ProgramStatus,
  UserRole,
  UserStatus,
} from "@/generated/prisma";
import { sendSuccess } from "../utils/send-response";
import {
  NotFoundException,
  BadRequestException,
} from "../utils/http-exception";

export class AdminService {
  async getPrograms(params: AdminProgramQueryData) {
    const { status, category, search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProgramWhereInput = {};

    if (status && status !== "all") {
      if (status === "active") {
        whereClause.isActive = true;
      } else if (status === "inactive") {
        whereClause.isActive = false;
      }
    }

    if (category && category !== "all") {
      whereClause.category = {
        name: category,
      };
    }

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

    const [programs, totalCount] = await Promise.all([
      prisma.program.findMany({
        where: whereClause,
        skip,
        take: limit,
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
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      }),
      prisma.program.count({ where: whereClause }),
    ]);

    const { programService } = await import("./program.service");
    const formattedPrograms = programs.map((program) =>
      programService.transformProgramData(program),
    );

    return sendSuccess(
      {
        programs: formattedPrograms,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Programs fetched successfully",
    );
  }

  async updateProgramStatus(programId: string, data: ProgramActionData) {
    const { action, startDate } = data;

    const result = await prisma.$transaction(
      async (tx) => {
        const program = await tx.program.findUnique({
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
          throw new NotFoundException("Program not found");
        }

        let status: ProgramStatus;
        let isActive: boolean;
        let emailTemplate:
          | "APPLICATION_APPROVED"
          | "APPLICATION_DECLINED"
          | "PROGRAM_LIVE"
          | null = null;

        switch (action) {
          case "approve":
            if (program.status !== "PENDING_APPROVAL") {
              throw new BadRequestException(
                "Only pending programs can be approved",
              );
            }
            status = "APPROVED";
            isActive = false;
            emailTemplate = "APPLICATION_APPROVED";
            break;
          case "reject":
            if (program.status !== "PENDING_APPROVAL") {
              throw new BadRequestException(
                "Only pending programs can be rejected",
              );
            }
            status = "REJECTED";
            isActive = false;
            emailTemplate = "APPLICATION_DECLINED";
            break;
          case "activate":
            if (!["SUBMITTED", "INACTIVE"].includes(program.status)) {
              throw new BadRequestException(
                "Only submitted or inactive programs can be activated",
              );
            }
            status = "ACTIVE";
            isActive = true;
            emailTemplate = "PROGRAM_LIVE";
            break;
          case "deactivate":
            if (program.status !== "ACTIVE") {
              throw new BadRequestException(
                "Only active programs can be deactivated",
              );
            }
            status = "INACTIVE";
            isActive = false;
            break;
          default:
            throw new BadRequestException("Invalid action");
        }

        const updatedProgram = await tx.program.update({
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

        if (action === "approve" && startDate) {
          await tx.cohort.create({
            data: {
              programId: programId,
              startDate: new Date(startDate),
              name: "Inaugural Cohort",
              status: "UPCOMING",
              maxStudents: program.maxStudents || 30,
            },
          });
        }

        return {
          updatedProgram,
          emailData: emailTemplate
            ? {
                email: program.coach.user.email,
                template: emailTemplate,
                fullName: program.coach.user.fullName || "Coach",
              }
            : null,
          action,
        };
      },
      { timeout: 15000 },
    );

    if (result.emailData) {
      try {
        const { emailService } = await import("./email.service");
        await emailService.sendProgramProposalEmail(
          result.emailData.email,
          result.emailData.template,
          result.emailData.fullName,
        );
      } catch (error) {
        console.error("Failed to send program status email:", error);
      }
    }

    return sendSuccess(
      { program: result.updatedProgram },
      `Program ${result.action}ed successfully`,
    );
  }

  async getUsers(params?: AdminUserQueryData) {
    const { search, role, status, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    // Build where clause for Prisma query
    const whereClause: Prisma.UserWhereInput = {
      role: {
        in: ["COACH", "STUDENT"],
      },
    };

    // Apply role filter at database level
    if (role && role !== "all") {
      whereClause.role = role.toUpperCase() as UserRole;

      if (role === "COACH") {
        whereClause.coach = { isNot: null };
      }

      if (role === "STUDENT") {
        whereClause.student = { isNot: null };
      }
    }

    // Apply status filter at database level
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase() as UserStatus;
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

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause, // Ensure we only get users who are coaches
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          coach: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { fullName: "asc" }],
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return sendSuccess(
      {
        users,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Users fetched successfully",
    );
  }

  async getReviews(params?: AdminReviewQueryData) {
    const { search, targetType, rating, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    // Build common where clauses
    const ratingFilter =
      rating && rating !== "all" ? parseInt(rating) : undefined;

    const programWhere: Prisma.ProgramReviewWhereInput = {};
    const coachWhere: Prisma.CoachReviewWhereInput = {};
    const searchFilter:
      | Prisma.CoachReviewWhereInput
      | Prisma.ProgramReviewWhereInput = {
      OR: [
        { comment: { contains: search, mode: "insensitive" } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ],
    };

    if (ratingFilter) {
      programWhere.rating = ratingFilter;
      coachWhere.rating = ratingFilter;
    }

    if (search) {
      Object.assign(programWhere, searchFilter);
      Object.assign(coachWhere, searchFilter);
    }

    let reviews: unknown[] = [];
    let totalCount = 0;

    if (targetType === "COACH") {
      [reviews, totalCount] = await Promise.all([
        prisma.coachReview.findMany({
          where: coachWhere,
          skip,
          take: limit,
          include: {
            user: true,
            coach: { include: { user: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.coachReview.count({ where: coachWhere }),
      ]);
      reviews = reviews.map((r: any) => ({ ...r, targetType: "COACH" }));
    } else if (targetType === "PROGRAM") {
      [reviews, totalCount] = await Promise.all([
        prisma.programReview.findMany({
          where: programWhere,
          skip,
          take: limit,
          include: {
            user: true,
            program: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.programReview.count({ where: programWhere }),
      ]);
      reviews = reviews.map((r: any) => ({ ...r, targetType: "PROGRAM" }));
    } else {
      const [pReviews, pCount, cReviews, cCount] = await Promise.all([
        prisma.programReview.findMany({
          where: programWhere,
          include: { user: true, program: true },
          orderBy: { createdAt: "desc" },
          take: skip + limit,
        }),
        prisma.programReview.count({ where: programWhere }),
        prisma.coachReview.findMany({
          where: coachWhere,
          include: { user: true, coach: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
          take: skip + limit,
        }),
        prisma.coachReview.count({ where: coachWhere }),
      ]);

      const allReviews = [
        ...pReviews.map((r) => ({ ...r, targetType: "PROGRAM" })),
        ...cReviews.map((r) => ({ ...r, targetType: "COACH" })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      reviews = allReviews.slice(skip, skip + limit);
      totalCount = pCount + cCount;
    }

    return sendSuccess(
      {
        reviews: reviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          content: r.comment,
          targetType: r.targetType,
          createdAt: r.createdAt,
          reviewer: {
            id: r.user.id,
            fullName: r.user.fullName,
            email: r.user.email,
            avatarUrl: r.user.avatarUrl,
          },
          target: r.targetType === "PROGRAM" ? r.program : r.coach,
        })),
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Reviews fetched successfully",
    );
  }

  async getDashboardStats() {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        program: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = enrollments.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0,
    );

    const totalUsers = await prisma.user.count();

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const usersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          lt: lastMonth,
        },
      },
    });

    const userGrowth = totalUsers - usersLastMonth;

    // Get new signups this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newSignupsThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    const lastMonthStart = new Date(thisMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const newSignupsLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: thisMonth,
        },
      },
    });

    const signupGrowthPercent =
      newSignupsLastMonth > 0
        ? ((newSignupsThisMonth - newSignupsLastMonth) / newSignupsLastMonth) *
          100
        : 0;

    // Get active coaches count
    const activeCoaches = await prisma.coach.count({
      where: {
        isActive: true,
      },
    });

    const activeCoachesLastMonth = await prisma.coach.count({
      where: {
        isActive: true,
        createdAt: {
          lt: lastMonth,
        },
      },
    });

    const coachGrowth = activeCoaches - activeCoachesLastMonth;

    // Calculate revenue growth
    const enrollmentsLastMonth = await prisma.enrollment.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          lt: lastMonth,
        },
      },
      select: {
        program: {
          select: {
            price: true,
          },
        },
      },
    });

    const revenueLastMonth = enrollmentsLastMonth.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0,
    );

    const revenueGrowthPercent =
      revenueLastMonth > 0
        ? ((totalRevenue - revenueLastMonth) / revenueLastMonth) * 100
        : 0;

    return sendSuccess(
      {
        stats: {
          revenue: {
            value: `$${totalRevenue.toLocaleString()}`,
            change: `${
              revenueGrowthPercent >= 0 ? "+" : ""
            }${revenueGrowthPercent.toFixed(1)}% from last month`,
          },
          users: {
            value: totalUsers.toLocaleString(),
            change: `${
              userGrowth >= 0 ? "+" : ""
            }${userGrowth} from last month`,
          },
          signups: {
            value: `+${newSignupsThisMonth}`,
            change: `${
              signupGrowthPercent >= 0 ? "+" : ""
            }${signupGrowthPercent.toFixed(1)}% from last month`,
          },
          coaches: {
            value: activeCoaches.toString(),
            change: `${
              coachGrowth >= 0 ? "+" : ""
            }${coachGrowth} since last month`,
          },
        },
      },
      "Dashboard stats fetched successfully",
    );
  }

  async getRecentSignups(limit: number = 5) {
    const recentUsers = await prisma.user.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    const signups = recentUsers.map((user) => ({
      name: user.fullName || user.email,
      email: user.email,
      avatar: user.avatarUrl,
      role:
        user.role === "COACH"
          ? "Coach"
          : user.role === "STUDENT"
            ? "Student"
            : "Admin",
      joined: user.createdAt.toISOString(),
    }));

    return sendSuccess({ signups }, "Recent signups fetched successfully");
  }

  async getPlatformActivity(limit: number = 10) {
    // Get recent coaches
    const recentCoaches = await prisma.coach.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Get recent programs
    const recentPrograms = await prisma.program.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        title: true,
        createdAt: true,
      },
    });

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Combine and sort all activities
    const activities: Array<{
      type: string;
      description: string;
      time: string;
      timestamp: Date;
    }> = [];

    recentCoaches.forEach((coach) => {
      activities.push({
        type: "New Coach",
        description: `${
          coach.user.fullName || "A new coach"
        } has been approved as a new coach.`,
        time: getRelativeTime(coach.createdAt),
        timestamp: coach.createdAt,
      });
    });

    recentPrograms.forEach((program) => {
      activities.push({
        type: "New Program",
        description: `A new program "${program.title}" was created.`,
        time: getRelativeTime(program.createdAt),
        timestamp: program.createdAt,
      });
    });

    recentStudents.forEach((student) => {
      activities.push({
        type: "New Student",
        description: `${
          student.user.fullName || student.user.email
        } signed up as a new student.`,
        time: getRelativeTime(student.createdAt),
        timestamp: student.createdAt,
      });
    });

    // Sort by timestamp descending and take limit
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map((activity) => {
        const { timestamp, ...rest } = activity;
        void timestamp;
        return rest;
      });

    return sendSuccess(
      { activities: sortedActivities },
      "Platform activity fetched successfully",
    );
  }

  async getEvents(params?: AdminEventQueryData) {
    const { search, eventType, status, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EventWhereInput = {};

    if (eventType && eventType !== "all") {
      whereClause.eventType = eventType;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

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
      ];
    }

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: [
          {
            date: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    return sendSuccess(
      {
        events,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Events fetched successfully",
    );
  }

  async updateCohort(
    cohortId: string,
    data: {
      name?: string;
      startDate?: string | Date;
      endDate?: string | Date;
      maxStudents?: number;
    },
  ) {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { program: true },
    });

    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    const updatedCohort = await prisma.cohort.update({
      where: { id: cohortId },
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        maxStudents: data.maxStudents,
        updatedAt: new Date(),
      },
      include: {
        program: {
          select: { id: true, title: true, slug: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return sendSuccess(
      { cohort: updatedCohort },
      "Cohort updated successfully",
    );
  }

  async getCohortsByProgram(programId: string) {
    const cohorts = await prisma.cohort.findMany({
      where: { programId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return sendSuccess({ cohorts }, "Cohorts fetched successfully");
  }

  async createCohort(
    programId: string,
    data: { name?: string; startDate: string; maxStudents?: number },
  ) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    const cohort = await prisma.cohort.create({
      data: {
        programId,
        name: data.name || "New Cohort",
        startDate: new Date(data.startDate),
        maxStudents: data.maxStudents || program.maxStudents || 30,
        status: "UPCOMING",
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return sendSuccess({ cohort }, "Cohort created successfully", 201);
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export const adminService = new AdminService();
