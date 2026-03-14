import { prisma } from "@/lib/prisma";
import { ReviewTargetType, Prisma } from "@/generated/prisma";
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
  async createCoachReview(data: Omit<CreateReviewData, "targetType">) {
    const { reviewerId, targetId, rating, content, sessionId } = data;

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

    await this.validateCoachReview(targetId, reviewerId, sessionId);

    // Check for existing review
    const existingReview = await prisma.coachReview.findFirst({
      where: { userId: reviewerId, coachId: targetId },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this coach");
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.coachReview.create({
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

      await this.updateCoachRating(tx, targetId, rating);

      return review;
    });

    return sendSuccess(
      {
        reviewId: result.id,
      },
      "Coach review submitted successfully",
      201
    );
  }

  async createProgramReviewBySlug(data: Omit<CreateReviewBySlugData, "targetType" | "targetId">) {
    const { slug, ...reviewData } = data;

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return this.createProgramReview({
      ...reviewData,
      targetId: program.id,
    });
  }

  async createProgramReview(data: Omit<CreateReviewData, "targetType">) {
    const { reviewerId, targetId, rating, content } = data;

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

    await this.validateProgramReview(targetId, reviewerId);

    // Check for existing review
    const existingReview = await prisma.programReview.findFirst({
      where: { userId: reviewerId, programId: targetId },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this program");
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.programReview.create({
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

      await this.updateProgramRating(tx, targetId, rating);

      return review;
    });

    return sendSuccess(
      {
        reviewId: result.id,
      },
      "Program review submitted successfully",
      201
    );
  }

  async deleteCoachReview(id: string) {
    const review = await prisma.coachReview.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    const targetId = review.coachId;

    await prisma.$transaction(async (tx) => {
      await tx.coachReview.delete({ where: { id } });

      const result = await tx.coachReview.aggregate({
        where: { coachId: targetId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAvgRating = result._avg.rating || 0;
      const newTotalReviews = result._count.id || 0;

      await tx.coach.update({
        where: { id: targetId },
        data: {
          rating: Number(newAvgRating.toFixed(1)),
          totalReviews: newTotalReviews,
        },
      });
    });

    return sendSuccess(null, "Coach review deleted successfully");
  }

  async deleteProgramReview(id: string) {
    const review = await prisma.programReview.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    const targetId = review.programId;

    await prisma.$transaction(async (tx) => {
      await tx.programReview.delete({ where: { id } });

      const result = await tx.programReview.aggregate({
        where: { programId: targetId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAvgRating = result._avg.rating || 0;
      const newTotalReviews = result._count.id || 0;

      await tx.program.update({
        where: { id: targetId },
        data: {
          rating: Number(newAvgRating.toFixed(1)),
          totalReviews: newTotalReviews,
        },
      });
    });

    return sendSuccess(null, "Program review deleted successfully");
  }

  async getProgramReviewsBySlug(
    slug: string,
    sortOptions: ReviewSortOptions
  ) {
    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return this.getProgramReviews(program.id, sortOptions);
  }

  async getCoachReviews(
    targetId: string,
    sortOptions: ReviewSortOptions
  ) {
    const { sortBy, page, limit } = sortOptions;
    const offset = (page - 1) * limit;

    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.coachReview.findMany({
        where: { coachId: targetId },
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
      prisma.coachReview.count({ where: { coachId: targetId } }),
    ]);

    const ratingDistribution = await this.getCoachRatingDistribution(targetId);
    const targetEntity = await this.getCoachEntityInfo(targetId);
    const totalPages = Math.ceil(totalCount / limit);

    return sendSuccess(
      {
        reviews: reviews.map((review) => ({
          ...review,
          reviewerId: review.userId,
          targetType: "COACH" as const,
          content: review.comment,
          reviewer: review.user,
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
      "Coach reviews fetched successfully"
    );
  }

  async getProgramReviews(
    targetId: string,
    sortOptions: ReviewSortOptions
  ) {
    const { sortBy, page, limit } = sortOptions;
    const offset = (page - 1) * limit;

    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.programReview.findMany({
        where: { programId: targetId },
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
      prisma.programReview.count({ where: { programId: targetId } }),
    ]);

    const ratingDistribution = await this.getProgramRatingDistribution(targetId);
    const targetEntity = await this.getProgramEntityInfo(targetId);
    const totalPages = Math.ceil(totalCount / limit);

    return sendSuccess(
      {
        reviews: reviews.map((review) => ({
          ...review,
          reviewerId: review.userId,
          targetType: "PROGRAM" as const,
          content: review.comment,
          reviewer: review.user,
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
      "Program reviews fetched successfully"
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

  private async updateCoachRating(
    tx: Prisma.TransactionClient,
    targetId: string,
    newRating: number
  ) {
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
  }

  private async updateProgramRating(
    tx: Prisma.TransactionClient,
    targetId: string,
    newRating: number
  ) {
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

  private async getCoachRatingDistribution(targetId: string) {
    const reviews = await prisma.coachReview.findMany({
      where: { coachId: targetId },
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

  private async getProgramRatingDistribution(targetId: string) {
    const reviews = await prisma.programReview.findMany({
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

  private async getCoachEntityInfo(targetId: string) {
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
  }

  private async getProgramEntityInfo(targetId: string) {
    return await prisma.program.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        title: true,
        rating: true,
        totalReviews: true,
      },
    });
  }
}

export const reviewService = new ReviewService();
