import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, rating, oldest

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

    // Find coach by slug
    const coach = await prisma.coach.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

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

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }; // default
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch reviews with pagination
    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: {
          targetId: coach.id,
          targetType: "COACH",
          isPublic: true,
        },
        orderBy,
        take: limit,
        skip: offset,
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
      }),
      prisma.review.count({
        where: {
          targetId: coach.id,
          targetType: "COACH",
          isPublic: true,
        },
      }),
    ]);

    // Use exact Prisma Review model structure
    const transformedReviews = reviews.map((review) => ({
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
      // Related data
      reviewer: review.reviewer,
      reviewee: review.reviewee,
    }));

    // Get all reviews for rating distribution
    const allReviews = await prisma.review.findMany({
      where: {
        targetId: coach.id,
        targetType: "COACH",
        isPublic: true,
      },
      select: {
        rating: true,
      },
    });

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((review) => {
      const rating = review.rating;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      }
    });

    const totalPages = Math.ceil(totalReviews / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews: transformedReviews,
          coach: {
            id: coach.id,
            name: coach.fullName,
            totalReviews: totalReviews,
          },
          ratingDistribution,
          pagination: {
            currentPage: page,
            totalPages,
            totalReviews,
            hasNextPage,
            hasPreviousPage,
            limit,
          },
        },
        message: "Reviews fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching coach reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}
