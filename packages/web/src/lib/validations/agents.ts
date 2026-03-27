import { UserRole } from "@/enums";
import { z } from "zod";

export const agentsSchema = z.object({
    userId: z.string().min(1, "User ID is required").optional(),
    message: z.string().min(1, "Message is required"),
    userRole: z.nativeEnum(UserRole).optional()
});

export type AgentInput = z.infer<typeof agentsSchema>;
