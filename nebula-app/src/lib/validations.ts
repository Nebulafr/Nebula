import { z } from "zod";
import { UserRole, SkillLevel, DifficultyLevel } from "@/generated/prisma";

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  week: z.number().min(1, "Week number must be at least 1"),
  description: z.string().min(1, "Module description is required"),
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
      DifficultyLevel.BEGINNER,
      DifficultyLevel.INTERMEDIATE,
      DifficultyLevel.ADVANCED,
    ])
    .optional(),
  maxStudents: z.number().min(1, "Max students must be at least 1").optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
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
});

export const programActionSchema = z.object({
  action: z.enum(["activate", "deactivate"]),
  reason: z.string().optional(),
});

export const programStatusUpdateSchema = z.object({
  action: z.enum(["approve", "reject", "activate", "pause"]),
  reason: z.string().optional(),
});

export const createEnrollmentSchema = z.object({
  coachId: z.string().min(1, "Coach ID is required"),
  time: z.string().min(1, "Time selection is required"),
  date: z.string().optional(),
});

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
});

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

export const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.nativeEnum(UserRole),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.nativeEnum(UserRole),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  googleId: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.nativeEnum(UserRole),
  avatarUrl: z.string().optional(),
});

export const googleSigninSchema = z.object({
  googleId: z.string(),
});

export const updateStudentSchema = z.object({
  interestedProgram: z.string().min(1, "Interested program is required"),
  skillLevel: z.nativeEnum(SkillLevel),
  commitment: z.string().min(1, "Commitment level is required"),
  timeZone: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
});

export const createCoachSchema = z.object({
  email: z.string().email("Valid email is required"),
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Title is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  style: z.string().min(1, "Coaching style is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  pastCompanies: z.array(z.string()).optional(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  availability: z.string().min(1, "Availability is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  qualifications: z.array(z.string()).optional(),
  experience: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export const updateCoachProfileSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  style: z.string().min(1, "Coaching style is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  pastCompanies: z.array(z.string()).optional(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  availability: z.string().min(1, "Availability is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  qualifications: z.array(z.string()).optional(),
  experience: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export const coachQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 50)
    .optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  slug: z.string().min(1, "Category slug is required").optional(),
  isActive: z.boolean().optional(),
});

export const enrollmentSchema = z.object({
  coachId: z.string(),
  time: z.string(),
  date: z.string().optional(),
});

const eventSessionSchema = z.object({
  date: z.string().min(1, "Session date is required"),
  time: z.string().min(1, "Session time is required"),
  price: z.number().min(0, "Price must be positive").optional(),
  currency: z.string().min(1).max(3).default("EUR"),
  spotsLeft: z.number().int().positive("Spots must be positive").optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  eventType: z.enum(["WEBINAR", "SOCIAL", "WORKSHOP", "NETWORKING"], {
    errorMap: () => ({
      message:
        "Event type must be one of: WEBINAR, SOCIAL, WORKSHOP, NETWORKING",
    }),
  }),
  date: z.coerce.date(),
  location: z
    .string()
    .max(500, "Location must be less than 500 characters")
    .optional(),
  images: z.array(z.string().url("Image URL must be a valid URL")).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  organizerId: z.string().optional(),
  isPublic: z.boolean().default(true),
  maxAttendees: z
    .number()
    .int()
    .positive("Max attendees must be a positive number")
    .optional(),
  status: z
    .enum(["DRAFT", "PENDING", "UPCOMING", "LIVE", "COMPLETED", "CANCELLED"], {
      errorMap: () => ({
        message:
          "Status must be one of: DRAFT, PENDING, UPCOMING, LIVE, COMPLETED, CANCELLED",
      }),
    })
    .default("PENDING"),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([]),
  whatToBring: z
    .string()
    .max(1000, "What to bring must be less than 1000 characters")
    .optional(),
  additionalInfo: z
    .string()
    .max(2000, "Additional info must be less than 2000 characters")
    .optional(),
  sessions: z.array(eventSessionSchema).optional(),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  eventType: z
    .enum(["WEBINAR", "SOCIAL", "WORKSHOP", "NETWORKING"], {
      errorMap: () => ({
        message:
          "Event type must be one of: WEBINAR, SOCIAL, WORKSHOP, NETWORKING",
      }),
    })
    .optional(),
  date: z.coerce.date().optional(),
  location: z
    .string()
    .max(500, "Location must be less than 500 characters")
    .optional(),
  images: z.array(z.string().url("Image URL must be a valid URL")).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  organizerId: z.string().optional(),
  isPublic: z.boolean().optional(),
  maxAttendees: z
    .number()
    .int()
    .positive("Max attendees must be a positive number")
    .optional(),
  status: z
    .enum(["DRAFT", "PENDING", "UPCOMING", "LIVE", "COMPLETED", "CANCELLED"], {
      errorMap: () => ({
        message:
          "Status must be one of: DRAFT, PENDING, UPCOMING, LIVE, COMPLETED, CANCELLED",
      }),
    })
    .optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  whatToBring: z
    .string()
    .max(1000, "What to bring must be less than 1000 characters")
    .optional(),
  additionalInfo: z
    .string()
    .max(2000, "Additional info must be less than 2000 characters")
    .optional(),
  sessions: z.array(eventSessionSchema).optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${formattedError}`);
    }
    throw error;
  }
}

export type CreateProgramData = z.infer<typeof createProgramSchema>;
export type UpdateProgramData = z.infer<typeof updateProgramSchema>;
export type ProgramsQueryParams = z.infer<typeof programsQuerySchema>;
export type CreateEnrollmentData = z.infer<typeof createEnrollmentSchema>;
export type CreateSessionData = z.infer<typeof createSessionSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SigninData = z.infer<typeof signinSchema>;
export type GoogleAuthData = z.infer<typeof googleAuthSchema>;
export type GoogleSigninData = z.infer<typeof googleSigninSchema>;
export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type ProgramStatusUpdateData = z.infer<typeof programStatusUpdateSchema>;
export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type CreateCoachData = z.infer<typeof createCoachSchema>;
export type CoachQueryData = z.infer<typeof coachQuerySchema>;
export type CoachUpdateData = z.infer<typeof updateCoachProfileSchema>;
export type AdminProgramQueryData = z.infer<typeof adminProgramQuerySchema>;
export type ProgramActionData = z.infer<typeof programActionSchema>;
export type BookSessionData = z.infer<typeof bookSessionSchema>;
