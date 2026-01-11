import { prisma } from "@/lib/prisma";
import { AdminProgramQueryData, ProgramActionData } from "@/lib/validations";
import { ProgramStatus } from "@/generated/prisma";
import { sendSuccess } from "../utils/send-response";
import { EmailService } from "./email.service";

export class AdminService {
  static async getPrograms(params: AdminProgramQueryData) {
    const { status, category, search } = params;

    const whereClause: any = {};

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

    const formattedPrograms = programs.map((program) => ({
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
      category: program.category,
      coach: program.coach,
      _count: program._count,
    }));

    return sendSuccess(
      { programs: formattedPrograms },
      "Programs fetched successfully"
    );
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
    let emailTemplate: "APPLICATION_APPROVED" | "APPLICATION_DECLINED" | "PROGRAM_LIVE" | null = null;

    switch (action) {
      case "approve":
        status = "ACTIVE";
        isActive = true;
        // Send PROGRAM_LIVE email when approving from PENDING_APPROVAL
        if (program.status === "PENDING_APPROVAL") {
          emailTemplate = "PROGRAM_LIVE";
        }
        break;
      case "reject":
        status = "REJECTED";
        isActive = false;
        emailTemplate = "APPLICATION_DECLINED";
        break;
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

    // Send email notification if applicable
    if (emailTemplate) {
      try {
        await EmailService.sendProgramProposalEmail(
          program.coach.user.email,
          emailTemplate,
          program.coach.user.fullName || "Coach"
        );
      } catch (error) {
        console.error("Failed to send program status email:", error);
        // Don't fail the status update if email fails
      }
    }

    // Log the action with reason if provided
    if (reason) {
      console.log(`Program ${programId} ${action}ed with reason: ${reason}`);
    }

    return sendSuccess(
      { program: updatedProgram },
      `Program ${action}ed successfully`
    );
  }

  static async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { search, role, status } = params || {};

    // Build where clause for Prisma query
    const whereClause: any = {
      role: {
        in: ["COACH", "STUDENT", "ADMIN"],
      },
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
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
    });

    return sendSuccess({ users }, "Users fetched successfully");
  }

  static async getReviews(params?: {
    search?: string;
    targetType?: string;
    status?: string;
    rating?: string;
  }) {
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

    return sendSuccess({ reviews }, "Reviews fetched successfully");
  }

  static async getDashboardStats() {
    // Get total revenue (sum of all paid enrollments)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        paymentStatus: "PAID",
      },
      include: {
        program: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = enrollments.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0
    );

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get users from last month for comparison
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
      include: {
        program: {
          select: {
            price: true,
          },
        },
      },
    });

    const revenueLastMonth = enrollmentsLastMonth.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0
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
      "Dashboard stats fetched successfully"
    );
  }

  static async getRecentSignups(limit: number = 5) {
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

  static async getPlatformActivity(limit: number = 10) {
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
      .map(({ timestamp, ...activity }) => activity);

    return sendSuccess(
      { activities: sortedActivities },
      "Platform activity fetched successfully"
    );
  }

  static async getEvents(params?: {
    search?: string;
    eventType?: string;
    status?: string;
  }) {
    const { search, eventType, status } = params || {};

    const whereClause: any = {};

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

    const events = await prisma.event.findMany({
      where: whereClause,
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
      orderBy: {
        date: "desc",
        createdAt: "desc",
      },
    });

    return sendSuccess({ events }, "Events fetched successfully");
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
