import { z } from "zod";
import { ExperienceLevel } from "@/generated/prisma";

export const updateStudentSchema = z.object({
  interestedCategoryId: z.string().min(1, "Interested category is required"),
  skillLevel: z.nativeEnum(ExperienceLevel),
  commitment: z.string().min(1, "Commitment level is required"),
  timeZone: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
});

export const studentOnboardingStep1Schema = z.object({
  interestedCategoryId: z.string().min(1, "Please select an area of interest"),
});

export const studentOnboardingStep2Schema = z.object({
  skillLevel: z.enum([ExperienceLevel.BEGINNER, ExperienceLevel.INTERMEDIATE, ExperienceLevel.ADVANCED], {
    errorMap: () => ({ message: "Please select a skill level" }),
  }),
});

export const studentOnboardingStep3Schema = z.object({
  availability: z.string().min(1, "Please select your time commitment"),
});

export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type StudentOnboardingStep1Data = z.infer<typeof studentOnboardingStep1Schema>;
export type StudentOnboardingStep2Data = z.infer<typeof studentOnboardingStep2Schema>;
export type StudentOnboardingStep3Data = z.infer<typeof studentOnboardingStep3Schema>;
