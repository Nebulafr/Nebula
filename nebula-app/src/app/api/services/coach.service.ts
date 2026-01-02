import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CoachQueryData,
  CoachUpdateData,
  CreateCoachData,
} from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";
import { extractUserFromRequest } from "../utils/extract-user";

export class CoachService {
  static async findByUserId(userId: string) {
    return prisma.coach.findUnique({
      where: { userId },
    });
  }
  static async getCoaches(params: CoachQueryData) {
    const { category, search, limit = 50 } = params;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    const whereClause: any = {
      isActive: true,
    };

    if (category && category !== "All") {
      whereClause.specialties = {
        has: category,
      };
    }

    const coaches = await prisma.coach.findMany({
      where: whereClause,
      orderBy: {
        rating: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    let transformedCoaches = coaches.map((coach) => ({
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties: coach.specialties,
      pastCompanies: coach.pastCompanies,
      linkedinUrl: coach.linkedinUrl,
      availability: coach.availability,
      hourlyRate: coach.hourlyRate,
      rating: coach.rating,
      totalReviews: coach.totalReviews,
      totalSessions: coach.totalSessions,
      studentsCoached: coach.studentsCoached,
      isActive: coach.isActive,
      isVerified: coach.isVerified,
      slug: coach.slug,
      category: coach.category,
      qualifications: coach.qualifications,
      experience: coach.experience,
      timezone: coach.timezone,
      languages: coach.languages,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      transformedCoaches = transformedCoaches.filter(
        (coach) =>
          (coach.fullName?.toLowerCase() || "").includes(searchLower) ||
          coach.title.toLowerCase().includes(searchLower) ||
          coach.specialties.some((s: string) =>
            s.toLowerCase().includes(searchLower)
          )
      );
    }

    const groupedCoaches = transformedCoaches.reduce(
      (acc: Record<string, any[]>, coach) => {
        const matchingCategories = categories.filter((category) =>
          coach.specialties.some(
            (specialty: string) =>
              specialty.toLowerCase() === category.name.toLowerCase()
          )
        );

        if (matchingCategories.length > 0) {
          matchingCategories.forEach((category) => {
            if (!acc[category.name]) {
              acc[category.name] = [];
            }

            const existingCoach = acc[category.name].find(
              (existingCoach) => existingCoach.id === coach.id
            );

            if (!existingCoach) {
              acc[category.name].push(coach);
            }
          });
        } else {
          if (!acc["General"]) {
            acc["General"] = [];
          }
          acc["General"].push(coach);
        }

        return acc;
      },
      {}
    );

    const formattedGroups = Object.entries(groupedCoaches).map(
      ([group, items]) => ({
        group,
        items,
      })
    );

    return sendSuccess(
      {
        coaches: transformedCoaches,
        groupedCoaches: formattedGroups,
      },
      "Coaches retrieved successfully"
    );
  }

  static async createCoach(userId: string, data: CreateCoachData) {
    const slug = `${data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${userId.substring(0, 8)}`;

    const newProfile = await prisma.coach.create({
      data: {
        userId,
        title: data.title,
        bio: data.bio,
        style: data.style,
        specialties: data.specialties,
        hourlyRate: data.hourlyRate,
        pastCompanies: data.pastCompanies || [],
        linkedinUrl: data.linkedinUrl || null,
        availability: data.availability,
        qualifications: data.qualifications || [],
        experience: data.experience || null,
        timezone: data.timezone || null,
        languages: data.languages || [],
        slug,
      },
    });

    return sendSuccess(newProfile, "Coach profile created successfully", 201);
  }

  static async updateCoach(userId: string, data: CoachUpdateData) {
    const updatedProfile = await prisma.coach.upsert({
      where: { userId },
      update: {
        userId,
        title: data.title,
        bio: data.bio,
        style: data.style,
        specialties: data.specialties,
        hourlyRate: data.hourlyRate,
        pastCompanies: data.pastCompanies || [],
        linkedinUrl: data.linkedinUrl || null,
        availability: data.availability,
        qualifications: data.qualifications || [],
        experience: data.experience || null,
        timezone: data.timezone || null,
        languages: data.languages || [],
        updatedAt: new Date(),
      },
      create: {
        userId,
        title: data.title,
        bio: data.bio,
        style: data.style,
        specialties: data.specialties,
        hourlyRate: data.hourlyRate,
        pastCompanies: data.pastCompanies || [],
        linkedinUrl: data.linkedinUrl || null,
        availability: data.availability,
        qualifications: data.qualifications || [],
        experience: data.experience || null,
        timezone: data.timezone || null,
        languages: data.languages || [],
        updatedAt: new Date(),
      },
    });

    return sendSuccess(updatedProfile, "Coach profile updated successfully");
  }

  static async getProfile(userId: string) {
    const coach = await this.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    return sendSuccess(coach, "Coach profile fetched successfully");
  }

  static async findCoachIdBySlug(slug: string) {
    const coach = await prisma.coach.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!coach) {
      throw new NotFoundException("Coach not found");
    }

    return coach.id;
  }

  static async getCoachById(coachId: string, request?: NextRequest) {
    const coach = await prisma.coach.findFirst({
      where: {
        id: coachId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException("Coach not found");
    }

    let userId: string | undefined;
    if (request) {
      const user = await extractUserFromRequest(request);
      userId = user?.id;
    }

    const [programs, reviews, hasUserReviewed] = await Promise.all([
      this.fetchCoachPrograms(coachId),
      this.fetchCoachReviews(coachId),
      userId
        ? this.checkUserReview(coachId, userId, "COACH")
        : Promise.resolve(false),
    ]);

    const transformedCoach = this.transformCoachData(
      coach,
      programs,
      reviews,
      hasUserReviewed
    );

    return sendSuccess(
      { coach: transformedCoach },
      "Coach fetched successfully"
    );
  }

  static async fetchCoachPrograms(coachId: string) {
    try {
      const programs = await prisma.program.findMany({
        where: {
          coachId: coachId,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      return programs.map((program) => ({
        id: program.id,
        title: program.title,
        category: program.category?.name || "General",
        slug: program.slug,
        description: program.description,
        price: program.price,
        duration: program.duration,
        rating: program.rating || 0,
        currentEnrollments: program._count.enrollments,
        createdAt: program.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching coach programs:", error);
      return [];
    }
  }

  static async fetchCoachReviews(coachId: string) {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          coachId,
          targetType: "COACH",
          isPublic: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return reviews.map((review) => ({
        id: review.id,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        targetId: review.coachId || review.programId,
        targetType: review.targetType,
        rating: review.rating,
        title: review.title,
        content: review.content,
        isVerified: review.isVerified,
        isPublic: review.isPublic,
        helpfulCount: review.helpfulCount,
        tags: review.tags,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        reviewer: review.reviewer,
        reviewee: review.reviewee,
      }));
    } catch (error) {
      console.error("Error fetching coach reviews:", error);
      return [];
    }
  }

  static async checkUserReview(
    targetId: string,
    userId: string,
    targetType: "COACH" | "PROGRAM"
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

  static transformCoachData(
    coach: any,
    programs: any[],
    reviews: any[],
    hasUserReviewed?: boolean
  ) {
    // Parse availability JSON if it exists
    let parsedAvailability = {};
    try {
      parsedAvailability = JSON.parse(coach.availability || "{}");
    } catch {
      parsedAvailability = {};
    }

    return {
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties: coach.specialties,
      pastCompanies: coach.pastCompanies,
      linkedinUrl: coach.linkedinUrl,
      availability: parsedAvailability,
      hourlyRate: coach.hourlyRate,
      rating: coach.rating,
      totalReviews: coach.totalReviews,
      totalSessions: coach.totalSessions,
      studentsCoached: coach.studentsCoached,
      isActive: coach.isActive,
      isVerified: coach.isVerified,
      slug: coach.slug,
      category: coach.category,
      qualifications: coach.qualifications,
      experience: coach.experience,
      timezone: coach.timezone,
      languages: coach.languages,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
      programs,
      reviews,
      hasUserReviewed: hasUserReviewed || false,
    };
  }

  static async getSuggestedCoaches(userId: string, limit: number = 4) {
    // Get the student's profile to understand their interests
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        interestedProgram: true,
        learningGoals: true,
      },
    });

    // Build the where clause based on student interests
    const whereClause: any = {
      isActive: true,
    };

    // If student has an interested program, filter coaches by that specialty
    if (student?.interestedProgram) {
      whereClause.specialties = {
        has: student.interestedProgram,
      };
    }

    // Fetch suggested coaches
    const coaches = await prisma.coach.findMany({
      where: whereClause,
      orderBy: [{ rating: "desc" }, { studentsCoached: "desc" }],
      take: limit,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Transform coaches to match the expected format
    const transformedCoaches = coaches.map((coach) => ({
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties: coach.specialties,
      pastCompanies: coach.pastCompanies,
      linkedinUrl: coach.linkedinUrl,
      availability: coach.availability,
      hourlyRate: coach.hourlyRate,
      rating: coach.rating,
      totalReviews: coach.totalReviews,
      totalSessions: coach.totalSessions,
      studentsCoached: coach.studentsCoached,
      isActive: coach.isActive,
      isVerified: coach.isVerified,
      slug: coach.slug,
      category: coach.category,
      qualifications: coach.qualifications,
      experience: coach.experience,
      timezone: coach.timezone,
      languages: coach.languages,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    }));

    return sendSuccess(
      {
        coaches: transformedCoaches,
      },
      "Suggested coaches retrieved successfully"
    );
  }

  static async connectGoogleCalendar(
    userId: string,
    accessToken: string,
    refreshToken?: string
  ) {
    const coach = await this.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        googleCalendarAccessToken: accessToken,
        googleCalendarRefreshToken: refreshToken,
        googleCalendarConnectedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return sendSuccess(null, "Google Calendar connected successfully");
  }
}
