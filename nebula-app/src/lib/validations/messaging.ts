import { z } from "zod";

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
