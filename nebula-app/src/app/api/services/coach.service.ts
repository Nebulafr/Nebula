import { prisma } from "@/lib/prisma";
import { CoachQueryData, CoachUpdateData } from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

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
        let groupKey = "General";

        const matchingCategory = categories.find((category) =>
          coach.specialties.some(
            (specialty: string) =>
              specialty.toLowerCase() === category.name.toLowerCase()
          )
        );

        if (matchingCategory) {
          groupKey = matchingCategory.name;
        }

        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }

        acc[groupKey].push(coach);
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

  static async getCoachById(coachId: string) {
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

    // Fetch related data in parallel
    const [programs, reviews] = await Promise.all([
      this.fetchCoachPrograms(coachId),
      this.fetchCoachReviews(coachId),
    ]);

    const transformedCoach = this.transformCoachData(coach, programs, reviews);

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

  static transformCoachData(coach: any, programs: any[], reviews: any[]) {
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
      programs,
      reviews,
    };
  }
}
