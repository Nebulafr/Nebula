import { z } from "zod";
import { UserRole, SkillLevel, DifficultyLevel } from "@/generated/prisma";
import { EventType, EventStatus } from "@/types/event";

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  week: z.number().min(1, "Week number must be at least 1"),
  description: z.string().min(1, "Module description is required"),
  materials: z.array(z.string().url("Material must be a valid URL")).optional(),
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
  targetAudience: z
    .string()
    .max(500, "Target audience description too long")
    .optional(),
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

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({
      message: "Event type must be either WEBINAR or SOCIAL",
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
  organizerId: z.string(),
  isPublic: z.boolean().default(true),
  maxAttendees: z
    .number()
    .int()
    .positive("Max attendees must be a positive number")
    .optional(),
  status: z
    .nativeEnum(EventStatus, {
      errorMap: () => ({
        message:
          "Status must be one of: DRAFT, PENDING, UPCOMING, LIVE, COMPLETED, CANCELLED",
      }),
    })
    .default(EventStatus.PENDING),
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
  lumaEventLink: z
    .string()
    .url("Luma event link must be a valid URL")
    .min(1, "Luma event link is required"),
  accessType: z.string().min(1, "Access type is required"),
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
    .nativeEnum(EventType, {
      errorMap: () => ({
        message: "Event type must be either WEBINAR or SOCIAL",
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
    .nativeEnum(EventStatus, {
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
  accessType: z.string().min(1, "Access type is required").optional(),
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

// User profile update schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Coach Onboarding validation schemas
export const coachOnboardingStep1Schema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters").max(100, "Role is too long"),
  company: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name is too long"),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").refine(
    (url) => url.includes("linkedin.com"),
    "Please enter a valid LinkedIn URL"
  ),
});

export const coachOnboardingStep2Schema = z.object({
  specialties: z.array(z.string()).min(1, "Please select at least one specialty"),
});

export const coachOnboardingStep3Schema = z.object({
  motivation: z.string().min(50, "Please provide at least 50 characters").max(1000, "Motivation is too long"),
});

export const coachOnboardingStep4Schema = z.object({
  style: z.string().min(50, "Please provide at least 50 characters").max(1000, "Description is too long"),
});

// Student Onboarding validation schemas
export const studentOnboardingStep1Schema = z.object({
  program: z.string().min(1, "Please select a program"),
});

export const studentOnboardingStep2Schema = z.object({
  skillLevel: z.enum([SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED], {
    errorMap: () => ({ message: "Please select a skill level" }),
  }),
});

export const enrollmentProgressSchema = z.object({
  progress: z.number().min(0).max(100),
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

export const conversationCreateSchema = z.object({
  participants: z.array(z.string()).min(2),
  type: z.enum(["DIRECT", "GROUP", "SUPPORT"]).optional().default("DIRECT"),
  title: z.string().optional(),
});

export const messageSendSchema = z.object({
  senderId: z.string(),
  content: z.string().min(1),
  type: z.enum(["TEXT", "IMAGE", "FILE", "LINK"]).optional().default("TEXT"),
});

export const markMessageReadSchema = z.object({
  userId: z.string(),
});

export const studentOnboardingStep3Schema = z.object({
  availability: z.string().min(1, "Please select your time commitment"),
});

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
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type CoachOnboardingStep1Data = z.infer<typeof coachOnboardingStep1Schema>;
export type CoachOnboardingStep2Data = z.infer<typeof coachOnboardingStep2Schema>;
export type CoachOnboardingStep3Data = z.infer<typeof coachOnboardingStep3Schema>;
export type CoachOnboardingStep4Data = z.infer<typeof coachOnboardingStep4Schema>;
export type StudentOnboardingStep1Data = z.infer<typeof studentOnboardingStep1Schema>;
export type StudentOnboardingStep2Data = z.infer<typeof studentOnboardingStep2Schema>;
export type StudentOnboardingStep3Data = z.infer<typeof studentOnboardingStep3Schema>;
