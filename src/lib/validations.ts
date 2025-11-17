import { z } from "zod";

// Module schema (matching ModuleFormData interface)
export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  week: z.number().min(1, "Week number must be at least 1"),
  description: z.string().min(1, "Module description is required"),
});

// Program creation schema
export const createProgramSchema = z.object({
  title: z.string().min(1, "Program title is required").max(100, "Title too long"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  objectives: z.array(z.string()).min(1, "At least one objective is required"),
  modules: z.array(moduleSchema).min(1, "At least one module is required"),
  price: z.number().min(0, "Price must be non-negative").optional(),
  duration: z.string().optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  maxStudents: z.number().min(1, "Max students must be at least 1").optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});

// Program update schema (all fields optional)
export const updateProgramSchema = createProgramSchema.partial();

// Query parameters schemas
export const programsQuerySchema = z.object({
  coachId: z.string().optional(),
  category: z.string().optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  search: z.string().optional(),
});

// Enrollment schema
export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().min(1, "Program ID is required"),
  coachId: z.string().min(1, "Coach ID is required"),
  amountPaid: z.number().min(0, "Amount must be non-negative"),
  time: z.string().min(1, "Time selection is required"),
  date: z.string().optional(),
});

// Session schema
export const createSessionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  coachId: z.string().min(1, "Coach ID is required"),
  programId: z.string().optional(),
  scheduledAt: z.string().transform(val => new Date(val)),
  duration: z.number().min(15, "Session must be at least 15 minutes"),
  notes: z.string().optional(),
});

// Review schema
export const createReviewSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  coachId: z.string().optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

// Auth schemas
export const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["student", "coach"]).optional().default("student"),
});

// Utility function for validation
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${formattedError}`);
    }
    throw error;
  }
}

// Types derived from schemas
export type CreateProgramData = z.infer<typeof createProgramSchema>;
export type UpdateProgramData = z.infer<typeof updateProgramSchema>;
export type ProgramsQueryParams = z.infer<typeof programsQuerySchema>;
export type CreateEnrollmentData = z.infer<typeof createEnrollmentSchema>;
export type CreateSessionData = z.infer<typeof createSessionSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;