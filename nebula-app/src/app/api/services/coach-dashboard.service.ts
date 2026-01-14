import { prisma } from "@/lib/prisma";
import { sendSuccess } from "../utils/send-response";
import { NotFoundException } from "../utils/http-exception";

export class CoachDashboardService {
  static async getStats(userId: string) {
    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: {
        id: true,
        rating: true,
        totalReviews: true,
        totalSessions: true,
        studentsCoached: true,
      },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get previous month date range
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get active students count
    const activeStudents = await prisma.enrollment.count({
      where: {
        coachId: coach.id,
        status: "ACTIVE",
      },
    });

    // Get last month's active students
    const lastMonthActiveStudents = await prisma.enrollment.count({
      where: {
        coachId: coach.id,
        status: "ACTIVE",
        enrollmentDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Get sessions this month
    const sessionsThisMonth = await prisma.session.count({
      where: {
        coachId: coach.id,
        scheduledTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Get sessions last month
    const sessionsLastMonth = await prisma.session.count({
      where: {
        coachId: coach.id,
        scheduledTime: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate revenue (this month)
    const enrollmentsThisMonth = await prisma.enrollment.findMany({
      where: {
        coachId: coach.id,
        enrollmentDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
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

    const revenueThisMonth = enrollmentsThisMonth.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0
    );

    // Calculate revenue (last month)
    const enrollmentsLastMonth = await prisma.enrollment.findMany({
      where: {
        coachId: coach.id,
        enrollmentDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
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

    const revenueLastMonth = enrollmentsLastMonth.reduce(
      (sum, enrollment) => sum + (enrollment.program.price || 0),
      0
    );

    // Calculate percentage changes
    const revenueChange =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : 0;

    const studentsChange =
      lastMonthActiveStudents > 0
        ? ((activeStudents - lastMonthActiveStudents) /
            lastMonthActiveStudents) *
          100
        : 0;

    const sessionsChange =
      sessionsLastMonth > 0
        ? ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100
        : 0;

    const stats = {
      totalRevenue: revenueThisMonth / 100, // Convert cents to dollars
      revenueChange: Math.round(revenueChange * 10) / 10,
      activeStudents,
      studentsChange: Math.round(studentsChange * 10) / 10,
      sessionsThisMonth,
      sessionsChange: Math.round(sessionsChange * 10) / 10,
      averageRating: coach.rating || 0,
      totalReviews: coach.totalReviews || 0,
      totalSessions: coach.totalSessions || 0,
      studentsCoached: coach.studentsCoached || 0,
    };

    return sendSuccess(stats, "Coach stats fetched successfully");
  }

  static async getSessions(userId: string, filter: string = "upcoming") {
    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    let whereClause: any = {
      coachId: coach.id,
    };

    // Apply filters
    if (filter === "today") {
      whereClause.scheduledTime = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (filter === "upcoming") {
      whereClause.scheduledTime = {
        gte: now,
      };
      whereClause.status = {
        in: ["SCHEDULED", "IN_PROGRESS"],
      };
    } else if (filter === "past") {
      whereClause.scheduledTime = {
        lt: now,
      };
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: filter === "past" ? "desc" : "asc",
      },
      take: 50,
    });

    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      scheduledTime: session.scheduledTime.toISOString(),
      duration: session.duration,
      status: session.status,
      meetLink: session.meetLink,
      notes: session.notes,
      students: session.attendance.map((att) => ({
        id: att.student.id,
        fullName: att.student.user.fullName,
        email: att.student.user.email,
        avatarUrl: att.student.user.avatarUrl,
        attended: att.attended,
        joinTime: att.joinTime?.toISOString(),
        leaveTime: att.leaveTime?.toISOString(),
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }));

    return sendSuccess(
      { sessions: transformedSessions },
      "Sessions fetched successfully"
    );
  }

  static async createSession(
    userId: string,
    data: {
      title: string;
      description?: string;
      scheduledTime: string;
      duration?: number;
      studentIds?: string[];
      meetLink?: string;
    }
  ) {
    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const {
      title,
      description,
      scheduledTime,
      duration,
      studentIds,
      meetLink,
    } = data;

    // Create session with attendance records
    const session = await prisma.session.create({
      data: {
        coachId: coach.id,
        title,
        description,
        scheduledTime: new Date(scheduledTime),
        duration: duration || 60,
        status: "SCHEDULED",
        meetLink,
        attendance: {
          create:
            studentIds?.map((studentId: string) => ({
              studentId,
              attended: false,
            })) || [],
        },
      },
      include: {
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess({ session }, "Session created successfully", 201);
  }

  static async getPrograms(userId: string, status: string = "all") {
    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    let whereClause: any = {
      coachId: coach.id,
    };

    // Apply status filter
    if (status === "active") {
      whereClause.isActive = true;
      whereClause.status = "ACTIVE";
    } else if (status === "inactive") {
      whereClause.OR = [{ isActive: false }, { status: "INACTIVE" }];
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        modules: {
          orderBy: {
            week: "asc",
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

    const transformedPrograms = programs.map((program) => ({
      id: program.id,
      title: program.title,
      slug: program.slug,
      description: program.description,
      objectives: program.objectives,
      price: program.price,
      duration: program.duration,
      difficultyLevel: program.difficultyLevel,
      maxStudents: program.maxStudents,
      currentEnrollments: program._count.enrollments,
      isActive: program.isActive,
      status: program.status,
      rating: program.rating,
      totalReviews: program._count.reviews,
      tags: program.tags,
      prerequisites: program.prerequisites,
      category: program.category,
      modules: program.modules,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
    }));

    return sendSuccess(
      { programs: transformedPrograms },
      "Programs fetched successfully"
    );
  }

  static async getRecentPayouts(userId: string, limit: number = 5) {
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const paidEnrollments = await prisma.enrollment.findMany({
      where: {
        coachId: coach.id,
        paymentStatus: "PAID",
      },
      include: {
        program: {
          select: { price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group enrollments by month
    const monthlyEarnings = new Map<
      string,
      { month: string; year: number; amount: number; date: Date }
    >();

    paidEnrollments.forEach((enrollment) => {
      const date = new Date(enrollment.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleString("default", { month: "long" });

      if (monthlyEarnings.has(monthYear)) {
        const existing = monthlyEarnings.get(monthYear)!;
        existing.amount += enrollment.program.price || 0;
      } else {
        monthlyEarnings.set(monthYear, {
          month: monthName,
          year: date.getFullYear(),
          amount: enrollment.program.price || 0,
          date: date,
        });
      }
    });

    const payouts = Array.from(monthlyEarnings.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit)
      .map((p) => ({
        id: `${p.year}-${p.month}`,
        month: `${p.month} ${p.year}`,
        amount: p.amount,
        method: "Bank Transfer",
        date: p.date.toISOString(),
      }));

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const payoutsThisMonth = paidEnrollments.filter(
      (e) => new Date(e.createdAt) >= thisMonthStart
    ).length;

    return sendSuccess(
      { payouts, payoutsThisMonth },
      "Recent payouts fetched successfully"
    );
  }
}
