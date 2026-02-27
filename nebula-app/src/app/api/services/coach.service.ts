import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import {
  CoachQueryData,
  CoachUpdateData,
  CreateCoachData,
} from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";
import { extractUserFromRequest } from "../utils/extract-user";

type CoachWithUserAndSpecialties = Prisma.CoachGetPayload<{
  include: {
    user: {
      select: {
        fullName: true;
        email: true;
        avatarUrl: true;
        role: true;
      };
    };
    specialties: {
      include: {
        category: true;
      };
    };
  };
}>;

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

    return sendSuccess(
      {
        coaches,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      "Coaches retrieved successfully",
    );
  }


  private transformCoach(coach: CoachWithUserAndSpecialties) {
    const coachSpecialties = coach.specialties.map((s: { category: { name: string } }) => s.category.name);
    return {
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties: coachSpecialties,
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
      qualifications: coach.qualifications,
      experience: coach.experience,
      timezone: coach.timezone,
      languages: coach.languages,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    };
  }

  private async fetchTransformedCoaches(params: CoachQueryData) {
    const { category, search, minPrice, maxPrice, company, school, limit = 16, page = 1 } = params;

    const whereClause: Prisma.CoachWhereInput = {
      isActive: true,
    };

    if (category && category !== "All") {
      whereClause.specialties = {
        some: {
          category: {
            name: {
              equals: category,
              mode: "insensitive",
            },
          },
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.hourlyRate = {};
      if (minPrice !== undefined) whereClause.hourlyRate.gte = minPrice;
      if (maxPrice !== undefined) whereClause.hourlyRate.lte = maxPrice;
    }

    if (company) {
      whereClause.pastCompanies = {
        has: company,
      };
    }

    if (school) {
      whereClause.qualifications = {
        has: school,
      };
    }

    if (search) {
      whereClause.OR = [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { title: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        {
          specialties: {
            some: {
              category: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [coaches, totalCount] = await Promise.all([
      prisma.coach.findMany({
        where: whereClause,
        orderBy: {
          rating: "desc",
        },
        skip,
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
          specialties: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.coach.count({ where: whereClause }),
    ]);

    return {
      coaches: coaches.map((coach) => this.transformCoach(coach)),
      totalCount,
    };
  }

  async createCoach(userId: string, data: CreateCoachData) {
    const slug = `${data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${userId.substring(0, 8)}`;

    const newProfile = await prisma.$transaction(async (tx) => {
      // Update user's full name if provided
      await tx.user.update({
        where: { id: userId },
        data: { fullName: data.fullName },
      });

      // Fetch or verify categories for specialties
      let specialtiesData: { categoryId: string }[] = [];
      if (data.specialties && data.specialties.length > 0) {
        const matchedCategories = await tx.category.findMany({
          where: {
            name: { in: data.specialties },
          },
        });
        specialtiesData = matchedCategories.map((cat) => ({
          categoryId: cat.id,
        }));
      }

      return await tx.coach.create({
        data: {
          userId,
          title: data.title,
          bio: data.bio,
          style: data.style,
          hourlyRate: data.hourlyRate,
          pastCompanies: data.pastCompanies || [],
          linkedinUrl: data.linkedinUrl || null,
          availability: data.availability,
          qualifications: data.qualifications || [],
          experience: data.experience || null,
          timezone: data.timezone || null,
          languages: data.languages || [],
          slug,
          specialties: {
            create: specialtiesData,
          },
        },
      });
    });

    return sendSuccess(newProfile, "Coach profile created successfully", 201);
  }

  async updateCoach(userId: string, data: CoachUpdateData) {
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update user's full name
      await tx.user.update({
        where: { id: userId },
        data: { fullName: data.fullName },
      });

      // Fetch or verify categories for specialties
      let specialtiesListData: { categoryId: string }[] = [];
      if (data.specialties && data.specialties.length > 0) {
        const matchedCategories = await tx.category.findMany({
          where: {
            name: { in: data.specialties },
          },
        });
        specialtiesListData = matchedCategories.map((cat) => ({
          categoryId: cat.id,
        }));
      }

      // First, find the coach to get the ID
      const coach = await tx.coach.findUnique({ where: { userId } });

      if (coach && specialtiesListData.length > 0) {
        // Delete old specialties
        await tx.coachCategory.deleteMany({
          where: { coachId: coach.id },
        });
      }

      return await tx.coach.upsert({
        where: { userId },
        update: {
          title: data.title,
          bio: data.bio,
          style: data.style,
          hourlyRate: data.hourlyRate,
          pastCompanies: data.pastCompanies || [],
          linkedinUrl: data.linkedinUrl || null,
          availability: data.availability,
          qualifications: data.qualifications || [],
          experience: data.experience || null,
          timezone: data.timezone || null,
          languages: data.languages || [],
          updatedAt: new Date(),
          specialties: {
            create: specialtiesListData,
          },
        },
        create: {
          userId,
          title: data.title,
          bio: data.bio,
          style: data.style,
          hourlyRate: data.hourlyRate,
          pastCompanies: data.pastCompanies || [],
          linkedinUrl: data.linkedinUrl || null,
          availability: data.availability,
          qualifications: data.qualifications || [],
          experience: data.experience || null,
          timezone: data.timezone || null,
          languages: data.languages || [],
          updatedAt: new Date(),
          specialties: {
            create: specialtiesListData,
          },
        },
      });
    });

    return sendSuccess(updatedProfile, "Coach profile updated successfully");
  }

  async getProfile(userId: string) {
    const coach = await this.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    const transformedCoach = {
      ...coach,
      specialties: coach.specialties.map((s) => s.category.name),
    };

    return sendSuccess(
      { coach: transformedCoach },
      "Coach profile fetched successfully",
    );
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

  async getCoachById(coachId: string, request?: NextRequest) {
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
      hasUserReviewed,
    );

    return sendSuccess(
      { coach: transformedCoach },
      "Coach fetched successfully",
    );
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

  transformCoachData(
    coach: any,
    programs: any[],
    reviews: any[],
    hasUserReviewed?: boolean,
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

  async getSuggestedCoaches(userId: string, limit: number = 4) {
    // Get the student's profile to understand their interests
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        interestedCategoryId: true,
        learningGoals: true,
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

    // If student has an interested category, try to find coaches with that specialty
    if (student?.interestedCategoryId) {
      coaches = await prisma.coach.findMany({
        where: {
          isActive: true,
          specialties: {
            some: {
              categoryId: student.interestedCategoryId,
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
    const transformedCoaches = coaches.map((coach) => ({
      id: coach.id,
      userId: coach.userId,
      email: coach.user?.email || "",
      fullName: coach.user?.fullName || "",
      avatarUrl: coach.user?.avatarUrl || null,
      title: coach.title,
      bio: coach.bio,
      style: coach.style,
      specialties: coach.specialties.map((s: { category: { name: string } }) => s.category.name),
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
      "Suggested coaches retrieved successfully",
    );
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

    return sendSuccess(null, "Google Calendar connected successfully");
  }

  async getAvailability(userId: string) {
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { availability: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    let availability;
    try {
      availability = JSON.parse(coach.availability || "{}");
    } catch {
      availability = {};
    }

    return sendSuccess({ availability }, "Availability fetched successfully");
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

    return sendSuccess({ availability }, "Availability updated successfully");
  }
}

export const coachService = new CoachService();
