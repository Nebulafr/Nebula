import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function findCoachBySlug(slug: string) {
  const coach = await prisma.coach.findFirst({
    where: {
      slug: slug,
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

  return coach;
}

async function fetchCoachPrograms(coachId: string) {
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

async function fetchCoachReviews(coachId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        targetId: coachId,
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
      // Exact Prisma Review model fields
      id: review.id,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      targetId: review.targetId,
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

function transformCoachData(coach: any, programs: any[], reviews: any[]) {
  return {
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
    programs,
    reviews,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing slug",
          message: "Coach slug is required",
        },
        { status: 400 }
      );
    }

    const coach = await findCoachBySlug(slug);

    if (!coach) {
      return NextResponse.json(
        {
          success: false,
          error: "Coach not found",
          message: "No coach found with the specified slug",
        },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [programs, reviews] = await Promise.all([
      fetchCoachPrograms(coach.id),
      fetchCoachReviews(coach.id),
    ]);

    const transformedCoach = transformCoachData(coach, programs, reviews);

    return NextResponse.json(
      {
        success: true,
        data: { coach: transformedCoach },
        message: "Coach fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching coach by slug:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch coach details",
      },
      { status: 500 }
    );
  }
}
