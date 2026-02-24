import { z } from "zod";
import { ExperienceLevel } from "@/generated/prisma";

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  week: z.number().min(1, "Week number must be at least 1"),
  description: z.string().min(1, "Module description is required"),
  materials: z
    .array(
      z.object({
        url: z.string().min(1, "Material URL or base64 data is required"),
        name: z.string().optional(),
        type: z.string().optional(),
        size: z.number().optional(),
        position: z.number().optional(),
      })
    )
    .optional(),
});

export const createProgramSchema = z.object({
  title: z
    .string()
    .min(1, "Program title is required")
    .max(100, "Title too long"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  objectives: z.array(z.string()).min(1, "At least one objective is required"),
  modules: z.array(moduleSchema).min(1, "At least one module is required"),
  price: z.number().min(0, "Price must be non-negative").optional(),
  duration: z.string().optional(),
  difficultyLevel: z
    .enum([
      ExperienceLevel.BEGINNER,
      ExperienceLevel.INTERMEDIATE,
      ExperienceLevel.ADVANCED,
    ])
    .optional(),
  maxStudents: z.number().min(1, "Max students must be at least 1").optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  targetAudience: z.array(z.nativeEnum(ExperienceLevel)).optional(),
  coCoachIds: z.array(z.string()).optional(),
});

export const updateProgramSchema = createProgramSchema.partial();

export const programsQuerySchema = z.object({
  coachId: z.string().optional(),
  category: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  search: z.string().optional(),
});

export const adminProgramQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val) => parseInt(val) || 10).optional(),
});

export const programActionSchema = z.object({
  action: z.enum(["approve", "reject", "activate", "deactivate"]),
  reason: z.string().optional(),
  startDate: z.string().optional(),
});

export const programStatusUpdateSchema = z.object({
  action: z.enum(["approve", "reject", "activate", "pause"]),
  reason: z.string().optional(),
});

export type CreateProgramData = z.infer<typeof createProgramSchema>;
export type UpdateProgramData = z.infer<typeof updateProgramSchema>;
export type ProgramsQueryParams = z.infer<typeof programsQuerySchema>;
export type AdminProgramQueryData = z.infer<typeof adminProgramQuerySchema>;
export type ProgramStatusUpdateData = z.infer<typeof programStatusUpdateSchema>;
export type ProgramActionData = z.infer<typeof programActionSchema>;
