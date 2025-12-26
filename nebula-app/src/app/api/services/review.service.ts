import { prisma } from "@/lib/prisma";
import { ReviewTargetType } from "@/generated/prisma";
import { sendSuccess } from "../utils/send-response";
import {
  NotFoundException,
  BadRequestException,
} from "../utils/http-exception";

export interface CreateReviewData {
  reviewerId: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  title?: string;
  content: string;
  sessionId?: string;
}

export interface CreateReviewBySlugData {
  reviewerId: string;
  targetType: ReviewTargetType;
  targetId: string;
  slug: string;
  rating: number;
  title?: string;
  content: string;
  sessionId?: string;
}

export interface ReviewSortOptions {
  sortBy: "recent" | "rating" | "oldest";
  page: number;
  limit: number;
}

export class ReviewService {
  static async createReviewBySlug(data: CreateReviewBySlugData) {
    const { slug, targetType, ...reviewData } = data;

    // Resolve the target ID from slug
    let resolvedTargetId: string;

    if (targetType === "PROGRAM") {
      const program = await prisma.program.findUnique({
        where: { slug },
      });

      if (!program) {
        throw new NotFoundException("Program not found");
      }

      resolvedTargetId = program.id;
    } else {
      // For COACH type, we expect the targetId to be passed directly
      resolvedTargetId = reviewData.targetId;
    }

    return this.createReview({
      ...reviewData,
      targetId: resolvedTargetId,
      targetType,
    });
  }

  static async createReview(data: CreateReviewData) {
    const {
      reviewerId,
      targetType,
      targetId,
      rating,
      title,
      content,
      sessionId,
    } = data;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    if (!content.trim()) {
      throw new BadRequestException("Review content is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: reviewerId },
      include: { student: true },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      throw new BadRequestException("Only students can create reviews");
    }

    let targetEntity;
    let revieweeId: string | undefined;

    switch (targetType) {
      case "COACH":
        targetEntity = await this.validateCoachReview(
          targetId,
          reviewerId,
          sessionId
        );
        revieweeId = targetEntity.userId;
        break;
      case "PROGRAM":
        targetEntity = await this.validateProgramReview(targetId, reviewerId);
        break;
      default:
        throw new BadRequestException("Invalid target type");
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId,
        [targetType === "COACH" ? "coachId" : "programId"]: targetId,
        targetType,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        `You have already reviewed this ${targetType.toLowerCase()}`
      );
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          reviewerId,
          revieweeId,
          [targetType === "COACH" ? "coachId" : "programId"]: targetId,
          targetType,
          rating,
          title,
          content: content.trim(),
          isPublic: true,
          isVerified: sessionId ? true : false,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      await this.updateTargetRating(tx, targetType, targetId, rating);

      return review;
    });

    return sendSuccess(
      {
        reviewId: result.id,
      },
      "Review submitted successfully",
      201
    );
  }

  static async getReviewsBySlug(
    targetType: ReviewTargetType,
    slug: string,
    sortOptions: ReviewSortOptions
  ) {

    // Resolve the target ID from slug
    let targetId: string;

    if (targetType === "PROGRAM") {
      const program = await prisma.program.findUnique({
        where: { slug },
      });

      if (!program) {
        throw new NotFoundException("Program not found");
      }

      targetId = program.id;
    } else {
      // For COACH type, we'll use the slug as the coach ID for now
      // This might need adjustment based on your coach routing strategy
      targetId = slug;
    }

    return this.getReviews(targetType, targetId, sortOptions);
  }

  static async getReviews(
    targetType: ReviewTargetType,
    targetId: string,
    sortOptions: ReviewSortOptions
  ) {
    const { sortBy, page, limit } = sortOptions;

    // Build where clause
    const whereClause: any = {
      [targetType === "COACH" ? "coachId" : "programId"]: targetId,
      targetType,
      isPublic: true,
    };

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }

    const offset = (page - 1) * limit;

    // Get reviews and total count
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      }),
      prisma.review.count({ where: whereClause }),
    ]);

    // Get rating distribution
    const ratingDistribution = await this.getRatingDistribution(
      targetType,
      targetId
    );

    // Get target entity info
    const targetEntity = await this.getTargetEntityInfo(targetType, targetId);

    const totalPages = Math.ceil(totalCount / limit);

    return sendSuccess(
      {
        reviews: reviews.map((review) => ({
          id: review.id,
          reviewerId: review.reviewerId,
          targetType: review.targetType,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isVerified: review.isVerified,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          reviewer: review.reviewer,
        })),
        targetEntity,
        ratingDistribution,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit,
        },
      },
      "Reviews fetched successfully"
    );
  }

  private static async validateCoachReview(
    coachId: string,
    reviewerId: string,
    sessionId?: string
  ) {
    const coach = await prisma.coach.findFirst({
      where: { id: coachId, isActive: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach not found");
    }

    if (sessionId) {
      const student = await prisma.student.findUnique({
        where: { userId: reviewerId },
      });

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          attendance: {
            where: { studentId: student?.id },
          },
        },
      });

      if (!session || session.coachId !== coachId) {
        throw new BadRequestException("Invalid session for this coach");
      }

      if (session.attendance.length === 0) {
        throw new BadRequestException(
          "You can only review sessions you attended"
        );
      }
    }

    return coach;
  }

  private static async validateProgramReview(
    programId: string,
    reviewerId: string
  ) {
    const program = await prisma.program.findFirst({
      where: { id: programId, isActive: true },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        programId,
        student: {
          userId: reviewerId,
        },
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        "You must be enrolled in this program to review it"
      );
    }

    return program;
  }

  private static async updateTargetRating(
    tx: any,
    targetType: ReviewTargetType,
    targetId: string,
    newRating: number
  ) {
    if (targetType === "COACH") {
      const coach = await tx.coach.findUnique({ where: { id: targetId } });
      const currentRating = coach?.rating || 0;
      const currentReviewCount = coach?.totalReviews || 0;
      const newReviewCount = currentReviewCount + 1;
      const updatedRating =
        (currentRating * currentReviewCount + newRating) / newReviewCount;

      await tx.coach.update({
        where: { id: targetId },
        data: {
          rating: Number(updatedRating.toFixed(1)),
          totalReviews: newReviewCount,
        },
      });
    } else if (targetType === "PROGRAM") {
      const program = await tx.program.findUnique({ where: { id: targetId } });
      const currentRating = program?.rating || 0;
      const currentReviewCount = program?.totalReviews || 0;
      const newReviewCount = currentReviewCount + 1;
      const updatedRating =
        (currentRating * currentReviewCount + newRating) / newReviewCount;

      await tx.program.update({
        where: { id: targetId },
        data: {
          rating: Number(updatedRating.toFixed(1)),
          totalReviews: newReviewCount,
        },
      });
    }
  }

  private static async getRatingDistribution(
    targetType: ReviewTargetType,
    targetId: string
  ) {
    const whereClause = {
      [targetType === "COACH"
        ? "coachId"
        : targetType === "PROGRAM"
        ? "programId"
        : "id"]: targetId,
      targetType,
      isPublic: true,
    };

    const reviews = await prisma.review.findMany({
      where: whereClause,
      select: { rating: true },
    });

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  }

  private static async getTargetEntityInfo(
    targetType: ReviewTargetType,
    targetId: string
  ) {
    switch (targetType) {
      case "COACH":
        return await prisma.coach.findUnique({
          where: { id: targetId },
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
            totalReviews: true,
          },
        });
      case "PROGRAM":
        return await prisma.program.findUnique({
          where: { id: targetId },
          select: {
            id: true,
            title: true,
            rating: true,
            totalReviews: true,
          },
        });
      default:
        return null;
    }
  }
}
