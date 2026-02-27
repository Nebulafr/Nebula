import { prisma } from "@/lib/prisma";
import { ReviewTargetType, CoachReview, ProgramReview, Prisma } from "@/generated/prisma";
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
  async createReviewBySlug(data: CreateReviewBySlugData) {
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

  async createReview(data: CreateReviewData) {
    const {
      reviewerId,
      targetType,
      targetId,
      rating,
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

    switch (targetType) {
      case "COACH":
        await this.validateCoachReview(
          targetId,
          reviewerId,
          sessionId
        );
        break;
      case "PROGRAM":
        await this.validateProgramReview(targetId, reviewerId);
        break;
      default:
        throw new BadRequestException("Invalid target type");
    }

    // Check for existing review
    const existingReview =
      targetType === "COACH"
        ? await prisma.coachReview.findFirst({
          where: { userId: reviewerId, coachId: targetId },
        })
        : await prisma.programReview.findFirst({
          where: { userId: reviewerId, programId: targetId },
        });

    if (existingReview) {
      throw new BadRequestException(
        `You have already reviewed this ${targetType.toLowerCase()}`
      );
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tx) => {
      let review;
      if (targetType === "COACH") {
        review = await tx.coachReview.create({
          data: {
            userId: reviewerId,
            coachId: targetId,
            rating,
            comment: content.trim(),
          },
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
      } else {
        review = await tx.programReview.create({
          data: {
            userId: reviewerId,
            programId: targetId,
            rating,
            comment: content.trim(),
          },
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
      }

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

  async deleteReview(id: string, targetType?: ReviewTargetType) {
    let resolvedTargetType = targetType;

    // If targetType is not provided, try to find the review in both tables
    if (!resolvedTargetType) {
      const coachReview = await prisma.coachReview.findUnique({ where: { id } });
      if (coachReview) {
        resolvedTargetType = "COACH";
      } else {
        const programReview = await prisma.programReview.findUnique({ where: { id } });
        if (programReview) {
          resolvedTargetType = "PROGRAM";
        }
      }
    }

    if (!resolvedTargetType) {
      throw new NotFoundException("Review not found");
    }

    const review =
      resolvedTargetType === "COACH"
        ? await prisma.coachReview.findUnique({ where: { id } })
        : await prisma.programReview.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    const targetId = resolvedTargetType === "COACH" ? (review as CoachReview).coachId : (review as ProgramReview).programId;

    await prisma.$transaction(async (tx) => {
      // Delete the review
      if (resolvedTargetType === "COACH") {
        await tx.coachReview.delete({ where: { id } });
      } else {
        await tx.programReview.delete({ where: { id } });
      }

      // Recalculate average rating and total count
      const result =
        resolvedTargetType === "COACH"
          ? await tx.coachReview.aggregate({
            where: { coachId: targetId },
            _avg: { rating: true },
            _count: { id: true },
          })
          : await tx.programReview.aggregate({
            where: { programId: targetId },
            _avg: { rating: true },
            _count: { id: true },
          });

      const newAvgRating = result._avg.rating || 0;
      const newTotalReviews = result._count.id || 0;

      // Update target entity
      if (resolvedTargetType === "COACH") {
        await tx.coach.update({
          where: { id: targetId },
          data: {
            rating: Number(newAvgRating.toFixed(1)),
            totalReviews: newTotalReviews,
          },
        });
      } else {
        await tx.program.update({
          where: { id: targetId },
          data: {
            rating: Number(newAvgRating.toFixed(1)),
            totalReviews: newTotalReviews,
          },
        });
      }
    });

    return sendSuccess(null, "Review deleted successfully");
  }

  async getReviewsBySlug(
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
      targetId = slug;
    }

    return this.getReviews(targetType, targetId, sortOptions);
  }

  async getReviews(
    targetType: ReviewTargetType,
    targetId: string,
    sortOptions: ReviewSortOptions
  ) {
    const { sortBy, page, limit } = sortOptions;

    // Build where clause
    const whereClause: Record<string, string> = {
      [targetType === "COACH" ? "coachId" : "programId"]: targetId,
    };

    // Build order by clause
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
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
    const [reviews, totalCount] =
      targetType === "COACH"
        ? await Promise.all([
          prisma.coachReview.findMany({
            where: whereClause,
            orderBy,
            take: limit,
            skip: offset,
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          }),
          prisma.coachReview.count({ where: whereClause }),
        ])
        : await Promise.all([
          prisma.programReview.findMany({
            where: whereClause,
            orderBy,
            take: limit,
            skip: offset,
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          }),
          prisma.programReview.count({ where: whereClause }),
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
          reviewerId: "userId" in review ? review.userId : "",
          targetType: targetType,
          rating: review.rating,
          content: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          reviewer: "user" in review ? review.user : undefined,
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

  private async validateCoachReview(
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

  private async validateProgramReview(
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

  private async updateTargetRating(
    tx: Prisma.TransactionClient,
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

  private async getRatingDistribution(
    targetType: ReviewTargetType,
    targetId: string
  ) {
    const reviews =
      targetType === "COACH"
        ? await prisma.coachReview.findMany({
          where: { coachId: targetId },
          select: { rating: true },
        })
        : await prisma.programReview.findMany({
          where: { programId: targetId },
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

  private async getTargetEntityInfo(
    targetType: ReviewTargetType,
    targetId: string
  ) {
    switch (targetType) {
      case "COACH":
        return await prisma.coach.findUnique({
          where: { id: targetId },
          select: {
            id: true,
            rating: true,
            totalReviews: true,
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
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

export const reviewService = new ReviewService();
