import { z } from "zod";

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val) => parseInt(val) || 10).optional(),
});

export const adminReviewQuerySchema = z.object({
  search: z.string().optional(),
  targetType: z.string().optional(),
  status: z.string().optional(),
  rating: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val) => parseInt(val) || 10).optional(),
});

export const adminEventQuerySchema = z.object({
  search: z.string().optional(),
  eventType: z.string().optional(),
  status: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val) => parseInt(val) || 10).optional(),
});

export type AdminUserQueryData = z.infer<typeof adminUserQuerySchema>;
export type AdminReviewQueryData = z.infer<typeof adminReviewQuerySchema>;
export type AdminEventQueryData = z.infer<typeof adminEventQuerySchema>;
