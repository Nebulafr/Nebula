"use server";
/**
 * @fileOverview A flow for creating a coaching session, including generating a Google Meet link.
 *
 * - createSession - A function that handles the session creation process.
 * - CreateSessionInput - The input type for the createSession function.
 * - CreateSessionOutput - The return type for the createSession function.
 */

import { ai } from "@/ai/genkit";
import { createCalendarEvent } from "@/services/google-api";
import { z } from "genkit";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@/generated/prisma";

const CreateSessionInputSchema = z.object({
  programId: z.string().describe("The ID of the program for this session."),
  coachId: z.string().describe("The ID of the coach hosting the session."),
  studentIds: z
    .array(z.string())
    .describe("An array of student IDs attending the session."),
  scheduledTime: z
    .string()
    .describe("The scheduled start time of the session in ISO 8601 format."),
  duration: z.number().default(60).describe("The duration of the session in minutes."),
  title: z.string().describe("The title of the session."),
  description: z.string().describe("A brief description of the session."),
  attendeeEmails: z
    .array(z.string())
    .describe("An array of attendee email addresses for the calendar invite."),
});
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

const CreateSessionOutputSchema = z.object({
  sessionId: z.string(),
  meetLink: z.string(),
});
export type CreateSessionOutput = z.infer<typeof CreateSessionOutputSchema>;

const createCalendarEventTool = ai.defineTool(
  {
    name: "createCalendarEventWithMeetLink",
    description:
      "Creates a Google Calendar event and generates a Google Meet link for it.",
    inputSchema: z.object({
      title: z.string(),
      description: z.string(),
      startTime: z.string(),
      attendeeEmails: z.array(z.string()),
    }),
    outputSchema: z.object({
      meetLink: z.string(),
      eventId: z.string(),
    }),
  },
  async (input) => {
    const thirtyMinutes = 30 * 60 * 1000;
    const startTime = new Date(input.startTime);
    const endTime = new Date(startTime.getTime() + thirtyMinutes);

    return await createCalendarEvent(
      input.title,
      input.description,
      startTime.toISOString(),
      endTime.toISOString(),
      input.attendeeEmails
    );
  }
);

export const createSessionFlow = ai.defineFlow(
  {
    name: "createSessionFlow",
    inputSchema: CreateSessionInputSchema,
    outputSchema: CreateSessionOutputSchema,
  },
  async (input) => {
    const googleEvent = await createCalendarEventTool({
      title: input.title,
      description: input.description,
      startTime: input.scheduledTime,
      attendeeEmails: input.attendeeEmails,
    });

    if (!googleEvent) {
      throw new Error("Failed to create Google Calendar event.");
    }

    // Create session in Prisma database
    const session = await prisma.session.create({
      data: {
        programId: input.programId,
        coachId: input.coachId,
        scheduledTime: new Date(input.scheduledTime),
        duration: input.duration,
        title: input.title,
        description: input.description,
        status: SessionStatus.SCHEDULED,
        meetLink: googleEvent.meetLink,
        googleEventId: googleEvent.eventId,
      },
    });

    // Create session attendance records for each student
    if (input.studentIds.length > 0) {
      await prisma.sessionAttendance.createMany({
        data: input.studentIds.map(studentId => ({
          sessionId: session.id,
          studentId: studentId,
          attended: false,
        })),
      });
    }

    return {
      sessionId: session.id,
      meetLink: googleEvent.meetLink,
    };
  }
);

export async function createSession(
  input: CreateSessionInput
): Promise<CreateSessionOutput> {
  return createSessionFlow(input);
}
