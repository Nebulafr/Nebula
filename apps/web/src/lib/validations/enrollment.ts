import { z } from "zod";

export const createEnrollmentSchema = z.object({
  coachId: z.string().min(1, "Coach ID is required"),
  time: z.string().min(1, "Time selection is required"),
  date: z.string().optional(),
});

export const enrollmentSchema = z.object({
  coachId: z.string(),
  time: z.string(),
  date: z.string().optional(),
});

export const enrollmentProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

export type CreateEnrollmentData = z.infer<typeof createEnrollmentSchema>;
