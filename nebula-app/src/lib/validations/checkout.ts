import { z } from "zod";

export const checkoutProgramSchema = z.object({
    programId: z.string(),
    cohortId: z.string().optional(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

export const checkoutSessionSchema = z.object({
    coachId: z.string(),
    scheduledTime: z.string(),
    duration: z.number().int().positive(),
    timezone: z.string().optional(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

export const checkoutEventSchema = z.object({
    eventId: z.string(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

export type CheckoutProgramData = z.infer<typeof checkoutProgramSchema>;
export type CheckoutSessionData = z.infer<typeof checkoutSessionSchema>;
export type CheckoutEventData = z.infer<typeof checkoutEventSchema>;
