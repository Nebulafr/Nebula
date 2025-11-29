import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middleware/auth";
import CatchError from "../../../utils/catch-error";
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "../../../utils/http-exception";
import { prisma } from "@/lib/prisma";
import sendResponse from "../../../utils/send-response";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1),
  sessionId: z.string().optional(),
});

export const POST = CatchError(
  isAuthenticated(
    async (
      request: NextRequest,
      context: { params: Promise<{ coachId: string }> }
    ) => {
      const body = await request.json();
      const { coachId } = await context.params;
      const user = (request as any).user;

      if (user.role !== "STUDENT") {
        throw new UnauthorizedException("Student access required");
      }

      const { rating, content, sessionId } = reviewSchema.parse(body);

      const coach = await prisma.coach.findUnique({
        where: {
          id: coachId,
          isActive: true,
        },
      });

      if (!coach) {
        throw new NotFoundException("Coach not found");
      }

      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        throw new BadRequestException(
          "Please complete your student profile to leave reviews"
        );
      }

      if (sessionId) {
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          include: {
            attendance: {
              where: {
                studentId: student.id,
              },
            },
          },
        });

        if (!session) {
          throw new NotFoundException("Session not found");
        }

        if (session.attendance.length === 0) {
          throw new UnauthorizedException(
            "You can only review sessions you attended"
          );
        }

        if (session.coachId !== coach.id) {
          throw new BadRequestException(
            "Session does not belong to this coach"
          );
        }
      }

      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId: user.id,
          targetId: coach.id,
          targetType: "COACH",
        },
      });

      if (existingReview) {
        throw new BadRequestException("You have already reviewed this coach");
      }

      const reviewResult = await prisma.$transaction(async (prisma) => {
        const review = await prisma.review.create({
          data: {
            reviewerId: user.id,
            revieweeId: coach.userId,
            targetId: coach.id,
            targetType: "COACH",
            rating: rating,
            content: content.trim(),
            isPublic: true,
            tags: [],
          },
        });

        const currentRating = coach.rating || 0;
        const currentReviewCount = coach.totalReviews || 0;

        const newReviewCount = currentReviewCount + 1;
        const newRating =
          (currentRating * currentReviewCount + rating) / newReviewCount;

        await prisma.coach.update({
          where: { id: coach.id },
          data: {
            rating: Number(newRating.toFixed(1)),
            totalReviews: newReviewCount,
          },
        });

        return {
          reviewId: review.id,
          newRating: Number(newRating.toFixed(1)),
          newReviewCount,
        };
      });

      return sendResponse.success(
        {
          reviewId: reviewResult.reviewId,
          rating: reviewResult.newRating,
          totalReviews: reviewResult.newReviewCount,
        },
        "Review submitted successfully",
        201
      );
    }
  )
);
