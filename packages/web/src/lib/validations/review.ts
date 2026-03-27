import { z } from "zod";

export const createReviewSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  coachId: z.string().optional(),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export const targetReviewSchema = z.object({
  targetType: z.enum(["COACH", "PROGRAM"]),
  targetId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(1).max(2000),
  sessionId: z.string().cuid().optional(),
});

export const reviewQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(["recent", "rating", "oldest"]).default("recent"),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;
