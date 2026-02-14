import { z } from "zod";
import { ExperienceLevel } from "@/generated/prisma";

export const createCoachSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
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
  fullName: z.string().min(1, "Full name is required").max(100),
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

export type CreateCoachData = z.infer<typeof createCoachSchema>;
export type CoachQueryData = z.infer<typeof coachQuerySchema>;
export type CoachUpdateData = z.infer<typeof updateCoachProfileSchema>;
export type CoachOnboardingStep1Data = z.infer<typeof coachOnboardingStep1Schema>;
export type CoachOnboardingStep2Data = z.infer<typeof coachOnboardingStep2Schema>;
export type CoachOnboardingStep3Data = z.infer<typeof coachOnboardingStep3Schema>;
export type CoachOnboardingStep4Data = z.infer<typeof coachOnboardingStep4Schema>;
