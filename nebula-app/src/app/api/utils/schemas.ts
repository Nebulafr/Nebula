import { z } from "zod";
import {
  UserRole,
  SkillLevel,
  DifficultyLevel,
  ProgramStatus,
} from "@/generated/prisma";

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

export const programStatusUpdateSchema = z.object({
  action: z.enum(["approve", "reject", "activate", "pause"]),
  reason: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  slug: z.string().min(1, "Category slug is required").optional(),
  isActive: z.boolean().optional(),
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
  organizerId: z.string(),
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
  imageUrl: z.string().url("Image URL must be a valid URL").optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
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
});

export type RegisterData = z.infer<typeof registerSchema>;
export type SigninData = z.infer<typeof signinSchema>;
export type GoogleAuthData = z.infer<typeof googleAuthSchema>;
export type GoogleSigninData = z.infer<typeof googleSigninSchema>;
export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type ProgramStatusUpdateData = z.infer<typeof programStatusUpdateSchema>;
export const coachQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 50)
    .optional(),
});
export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export const adminProgramQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export const programActionSchema = z.object({
  action: z.enum(["activate", "deactivate"]),
  reason: z.string().optional(),
});

export const createCoachSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
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

export const bookSessionSchema = z.object({
  coachId: z.string(),
  date: z.string(),
  startTime: z.string(),
  duration: z.number().default(60),
});

export const createProgramSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string()),
  modules: z
    .array(
      z.object({
        title: z.string(),
        week: z.number().optional(),
        description: z.string(),
      })
    )
    .optional(),
  price: z.number().optional(),
  duration: z.string().optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  maxStudents: z.number().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});

export const updateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  objectives: z.array(z.string()).optional(),
  price: z.number().optional(),
  duration: z.string().optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  maxStudents: z.number().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  status: z.nativeEnum(ProgramStatus).optional(),
});

export type CoachQueryData = z.infer<typeof coachQuerySchema>;
export type CoachUpdateData = z.infer<typeof updateCoachProfileSchema>;
export type AdminProgramQueryData = z.infer<typeof adminProgramQuerySchema>;
export type ProgramActionData = z.infer<typeof programActionSchema>;
export type BookSessionData = z.infer<typeof bookSessionSchema>;
export type CreateProgramData = z.infer<typeof createProgramSchema>;
export type UpdateProgramData = z.infer<typeof updateProgramSchema>;
