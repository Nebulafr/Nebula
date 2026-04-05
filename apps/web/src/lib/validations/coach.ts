import { z } from "zod";

export const experienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const createCoachSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  fullName: z.string().optional(),
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
  experiences: z.array(experienceSchema).optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
  country: z.string().min(1, "Country is required"),
  countryIso: z.string().min(2, "Country ISO is required"),
});

export const updateCoachProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  fullName: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  style: z.string().min(1, "Coaching style is required"),
  specialties: z.array(z.string().cuid()).min(1, "At least one specialty is required"),
  pastCompanies: z.array(z.string()).optional(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  availability: z.string().min(1, "Availability is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  qualifications: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
  country: z.string().optional(),
  countryIso: z.string().optional(),
});

export const updateCoachExperiencesSchema = z.object({
  experiences: z.array(experienceSchema),
});

export const coachQuerySchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  company: z.string().optional(),
  school: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 16)
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
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
export type UpdateCoachExperiencesData = z.infer<typeof updateCoachExperiencesSchema>;
