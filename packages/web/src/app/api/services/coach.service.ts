import { NextRequest } from "next/server";
import { prisma, Prisma } from "@nebula/database";
import {
  CoachQueryData,
  CoachUpdateData,
  CreateCoachData,
} from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";
import { stripeAccountService } from "./stripe-account.service";

// type CoachWithUserAndSpecialties = Prisma.CoachGetPayload<{
//   include: {
//     user: {
//       select: {
//         fullName: true;
//         email: true;
//         avatarUrl: true;
//         role: true;
//       };
//     };
//     specialties: {
//       include: {
//         category: true;
//       };
//     };
//   };
// }>;

export class CoachService {
  async findByUserId(userId: string) {
    return prisma.coach.findUnique({
      where: { userId },
      include: {
        specialties: {
          include: {
            category: true,
          },
        },
      },
    });
  }
  async getCoaches(params: CoachQueryData) {
    const { page = 1, limit = 16 } = params;

    const { coaches, totalCount } = await this.fetchTransformedCoaches(params);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      coaches,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }




  private async fetchTransformedCoaches(params: CoachQueryData) {
    const { search, limit = 16, page = 1 } = params;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CoachWhereInput = {
      ...this.buildCoachFilters(params),
      ...(search ? this.buildSearchQuery(search) : {}),
    };

    const [coaches, totalCount] = await Promise.all([
      prisma.coach.findMany({
        where: whereClause,
        orderBy: { rating: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { fullName: true, email: true, avatarUrl: true, role: true },
          },
          specialties: { include: { category: true } },
        },
      }),
      prisma.coach.count({ where: whereClause }),
    ]);

    return {
      coaches: coaches.map((coach) => this.mapCoachToTransformed(coach)),
      totalCount,
    };
  }


  private buildCoachFilters(params: CoachQueryData): Prisma.CoachWhereInput {
    const { category, minPrice, maxPrice, company, school } = params;
    const whereClause: Prisma.CoachWhereInput = { isActive: true };

    if (category && category !== "All") {
      whereClause.specialties = { some: { categoryId: category } };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.hourlyRate = {};
      if (minPrice !== undefined) whereClause.hourlyRate.gte = minPrice;
      if (maxPrice !== undefined) whereClause.hourlyRate.lte = maxPrice;
    }

    if (company) whereClause.pastCompanies = { has: company };
    if (school) whereClause.qualifications = { has: school };

    return whereClause;
  }

  private buildSearchQuery(search: string): Prisma.CoachWhereInput {
    return {
      OR: [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { title: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        {
          specialties: {
            some: {
              category: { name: { contains: search, mode: "insensitive" } },
            },
          },
        },
      ],
    };
  }

  private parseAvailability(availabilityJson: string | null): Record<string, any> {
    try {
      return JSON.parse(availabilityJson || "{}");
    } catch {
      return {};
    }
  }

  private mapCoachToTransformed(coach: any) {
    const specialties = Array.isArray(coach.specialties)
      ? coach.specialties.map((s: any) => ({
        id: s.categoryId || s.id || s,
        name: s.category?.name || s.name || s,
      }))
      : [];

    return {
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties,
      pastCompanies: coach.pastCompanies,
      linkedinUrl: coach.linkedinUrl,
      availability: typeof coach.availability === 'string' ? this.parseAvailability(coach.availability) : coach.availability,
      hourlyRate: coach.hourlyRate,
      rating: coach.rating,
      totalReviews: coach.totalReviews,
      totalSessions: coach.totalSessions,
      studentsCoached: coach.studentsCoached,
      isActive: coach.isActive,
      isVerified: coach.isVerified,
      slug: coach.slug,
      qualifications: coach.qualifications,
      experience: coach.experience,
      timezone: coach.timezone,
      languages: coach.languages,
      createdAt: coach.createdAt instanceof Date ? coach.createdAt.toISOString() : coach.createdAt,
      updatedAt: coach.updatedAt instanceof Date ? coach.updatedAt.toISOString() : coach.updatedAt,
    };
  }


  private async resolveSpecialties(specialties: string[]) {
    if (!specialties || specialties.length === 0) return [];

    return specialties.map((id) => ({
      categoryId: id,
    }));
  }

  async createCoach(userId: string, data: CreateCoachData) {
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${userId.substring(0, 8)}`;
    const specialtiesData = await this.resolveSpecialties(data.specialties || []);

    const newProfile = await prisma.$transaction(async (tx) => {
      await this.updateUserProfile(tx, userId, data);
      const coach = await this.upsertCoachProfile(tx, userId, { ...data, slug });
      await this.handleCoachSpecialties(tx, coach.id, specialtiesData);
      return coach;
    }, { timeout: 10000 });

    stripeAccountService.createAccount(userId).catch((err) => {
      console.error("Failed to create Stripe account in coach service:", err);
    });

    return newProfile;
  }

  async updateCoach(userId: string, data: CoachUpdateData) {
    const specialtiesData = await this.resolveSpecialties(data.specialties || []);

    const updatedProfile = await prisma.$transaction(async (tx) => {
      await this.updateUserProfile(tx, userId, data);
      const coach = await this.upsertCoachProfile(tx, userId, data);
      await this.handleCoachSpecialties(tx, coach.id, specialtiesData);
      return coach;
    }, { timeout: 10000 });

    return updatedProfile;
  }

  private async updateUserProfile(tx: any, userId: string, data: any) {
    const userData: any = {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      fullName: data.fullName,
    };

    if (data.country) userData.country = data.country;
    if (data.countryIso) userData.countryIso = data.countryIso;

    await tx.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  private async upsertCoachProfile(tx: any, userId: string, data: any) {
    const coachData = {
      title: data.title,
      bio: data.bio,
      style: data.style,
      hourlyRate: data.hourlyRate,
      pastCompanies: data.pastCompanies || [],
      linkedinUrl: data.linkedinUrl || null,
      availability: typeof data.availability === 'object' ? JSON.stringify(data.availability) : data.availability,
      qualifications: data.qualifications || [],
      experience: data.experience || null,
      timezone: data.timezone || null,
      languages: data.languages || [],
      updatedAt: new Date(),
    };

    return await tx.coach.upsert({
      where: { userId },
      update: coachData,
      create: {
        userId,
        ...coachData,
        slug: data.slug,
      },
    });
  }

  private async handleCoachSpecialties(tx: any, coachId: string, specialties: { categoryId: string }[]) {
    if (specialties.length > 0) {
      await tx.coachCategory.deleteMany({ where: { coachId } });
      await tx.coachCategory.createMany({
        data: specialties.map(s => ({ ...s, coachId })),
      });
    }
  }


  async getProfile(userId: string) {
    const coach = await this.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    return { coach: this.mapCoachToTransformed(coach) };
  }

  async findCoachIdBySlug(slug: string) {
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

  async getCoachById(coachId: string, authenticatedUserId?: string) {
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
        specialties: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException("Coach not found");
    }

    const [programs, reviews, hasUserReviewed] = await Promise.all([
      this.fetchCoachPrograms(coachId),
      this.fetchCoachReviews(coachId),
      authenticatedUserId
        ? this.checkUserReview(coachId, authenticatedUserId, "COACH")
        : Promise.resolve(false),
    ]);

    const transformedCoach = {
      ...this.mapCoachToTransformed(coach),
      programs,
      reviews,
      hasUserReviewed: hasUserReviewed || false,
    };

    return { coach: transformedCoach };
  }

  async fetchCoachPrograms(coachId: string) {
    try {
      const programs = await prisma.program.findMany({
        where: {
          coachId: coachId,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
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

  async fetchCoachReviews(coachId: string) {
    try {
      const reviews = await prisma.coachReview.findMany({
        where: {
          coachId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
        include: {
          user: {
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
        reviewerId: review.userId,
        targetId: review.coachId,
        targetType: "COACH",
        rating: review.rating,
        content: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        reviewer: review.user,
      }));
    } catch (error) {
      console.error("Error fetching coach reviews:", error);
      return [];
    }
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



  async getSuggestedCoaches(userId: string, limit: number = 4) {
    // Get the student's profile to understand their interests
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        interestedCategories: true,
      },
    });

    const includeOptions = {
      user: {
        select: {
          fullName: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
      specialties: {
        include: {
          category: true,
        },
      },
    };

    let coaches;

    const interestedCategoryIds =
      student?.interestedCategories?.map((ic) => ic.categoryId) || [];

    // If student has interested categories, try to find coaches with those specialties
    if (interestedCategoryIds.length > 0) {
      coaches = await prisma.coach.findMany({
        where: {
          isActive: true,
          specialties: {
            some: {
              categoryId: { in: interestedCategoryIds },
            },
          },
        },
        orderBy: [{ rating: "desc" }, { studentsCoached: "desc" }],
        take: limit,
        include: includeOptions,
      });
    }

    // If no coaches found for interested category, fall back to top-rated coaches
    if (!coaches || coaches.length === 0) {
      coaches = await prisma.coach.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ rating: "desc" }, { studentsCoached: "desc" }],
        take: limit,
        include: includeOptions,
      });
    }

    // Transform coaches to match the expected format
    return {
      coaches: coaches.map((coach) => this.mapCoachToTransformed(coach)),
    };
  }

  async connectGoogleCalendar(
    userId: string,
    accessToken: string,
    refreshToken?: string,
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
        updatedAt: new Date(),
      },
    });

    return null;
  }

  async getAvailability(userId: string) {
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { availability: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const availability = this.parseAvailability(coach.availability);
    return { availability };
  }

  async updateAvailability(userId: string, availability: Record<string, unknown>) {
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    if (!availability || typeof availability !== "object") {
      throw new Error("Invalid availability data");
    }

    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        availability: JSON.stringify(availability),
      },
    });

    return { availability };
  }
}

export const coachService = new CoachService();
