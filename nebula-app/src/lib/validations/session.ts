import { z } from "zod";

export const createSessionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  coachId: z.string().min(1, "Coach ID is required"),
  programId: z.string().optional(),
  scheduledAt: z.string().transform((val) => new Date(val)),
  duration: z.number().min(15, "Session must be at least 15 minutes"),
  notes: z.string().optional(),
});

export const bookSessionSchema = z.object({
  coachId: z.string(),
  date: z.string(),
  startTime: z.string(),
  duration: z.number().default(60),
  timezone: z.string().optional(),
});

export const rescheduleSessionSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  timezone: z.string().optional(),
});

export type CreateSessionData = z.infer<typeof createSessionSchema>;
export type BookSessionData = z.infer<typeof bookSessionSchema>;
