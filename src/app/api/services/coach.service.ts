import { prisma } from "@/lib/prisma";
import { CoachQueryData, CoachUpdateData } from "../utils/schemas";
import { NotFoundException } from "../utils/http-exception";
import sendResponse from "../utils/send-response";

export class CoachService {
  static async findByUserId(userId: string) {
    return prisma.coach.findUnique({
      where: { userId },
    });
  }
  static async getCoaches(params: CoachQueryData) {
    const { category, search, limit = 50 } = params;

    // Build Prisma where clause
    const whereClause: any = {
      isActive: true,
    };

    // Filter by category if provided
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

    // Use exact Prisma model structure
    let transformedCoaches = coaches.map((coach) => ({
      // Exact Prisma Coach model fields
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || coach.email,
      fullName: coach.user?.fullName || coach.fullName,
      avatarUrl: coach.user?.avatarUrl || coach.avatarUrl,
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

    // Apply search filter if provided
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

    // Group coaches by specialty
    const groupedCoaches = transformedCoaches.reduce(
      (acc: Record<string, any[]>, coach) => {
        let groupKey = "General";

        if (
          coach.specialties.includes("Career Prep") ||
          coach.specialties.includes("Product Management") ||
          coach.specialties.includes("Consulting") ||
          coach.specialties.includes("Strategy")
        ) {
          groupKey = "Career Prep";
        } else if (
          coach.specialties.includes("School Admission") ||
          coach.specialties.includes("Essay Writing") ||
          coach.specialties.includes("College Apps") ||
          coach.specialties.includes("MBA Applications")
        ) {
          groupKey = "School Admissions";
        } else if (
          coach.specialties.includes("Comedy") ||
          coach.specialties.includes("Acting") ||
          coach.specialties.includes("Entertainment")
        ) {
          groupKey = "Entertainment";
        } else if (
          coach.specialties.includes("Technology") ||
          coach.specialties.includes("Software Development") ||
          coach.specialties.includes("Data Science")
        ) {
          groupKey = "Technology";
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

    return {
      coaches: transformedCoaches,
      groupedCoaches: formattedGroups,
    };
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

    return sendResponse.success(
      updatedProfile,
      "Coach profile updated successfully"
    );
  }

  static async getProfile(userId: string) {
    const coach = await this.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    return sendResponse.success(coach, "Coach profile fetched successfully");
  }
}
