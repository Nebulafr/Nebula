import { z } from "zod";
import { EventType, EventStatus } from "@/types/event";

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

export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
