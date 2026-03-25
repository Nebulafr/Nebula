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

export const adminTransactionQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sourceType: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val) => parseInt(val) || 10).optional(),
});

export const adminCreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string(), // We'll convert to uppercase and validate in service/controller
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const adminUpdateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
});

export type AdminUserQueryData = z.infer<typeof adminUserQuerySchema>;
export type AdminReviewQueryData = z.infer<typeof adminReviewQuerySchema>;
export type AdminEventQueryData = z.infer<typeof adminEventQuerySchema>;
export type AdminTransactionQueryData = z.infer<typeof adminTransactionQuerySchema>;
export type AdminCreateUserData = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserData = z.infer<typeof adminUpdateUserSchema>;
