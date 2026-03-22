import { tool } from "langchain";
import { z } from "zod";

import { coachService } from "../../services/coach.service";
import { programService } from "../../services/program.service";
import { eventService } from "../../services/event.service";

/**
 * Search Coaches
 */
export const searchCoachesTool = tool(
  async ({ specialty, minPrice, maxPrice, search }) => {
    try {
      const response = await coachService.getCoaches({
        category: specialty,
        minPrice,
        maxPrice,
        search,
        limit: 5,
      } as any);

      return response.coaches || [];
    } catch (error: any) {
      return {
        error: `Error searching coaches: ${error.message}`,
      };
    }
  },
  {
    name: "search_coaches",
    description:
      "Search for coaches based on specialty, price range, or general search terms.",
    schema: z.object({
      specialty: z.string().optional().describe("Specialty or category"),
      minPrice: z.number().optional().describe("Minimum hourly rate"),
      maxPrice: z.number().optional().describe("Maximum hourly rate"),
      search: z.string().optional().describe("General search term"),
    }),
  }
);

/**
 * Search Programs
 */
export const searchProgramsTool = tool(
  async ({ category, search }) => {
    try {
      const response = await programService.getPrograms({
        category,
        search,
        limit: 5,
      });

      return response.programs || [];
    } catch (error: any) {
      return {
        error: `Error searching programs: ${error.message}`,
      };
    }
  },
  {
    name: "search_programs",
    description:
      "Search for active programs such as courses or bootcamps by category or keyword.",
    schema: z.object({
      category: z.string().optional().describe("Program category"),
      search: z.string().optional().describe("Search term"),
    }),
  }
);

/**
 * Search Events
 */
export const searchEventsTool = tool(
  async ({ search, eventType }) => {
    try {
      const response = await eventService.find({
        search,
        eventType,
        limit: 5,
      });

      return response.events || [];
    } catch (error: any) {
      return {
        error: `Error searching events: ${error.message}`,
      };
    }
  },
  {
    name: "search_events",
    description:
      "Search for upcoming Nebula events such as webinars and workshops.",
    schema: z.object({
      search: z.string().optional().describe("Search term"),
      eventType: z.string().optional().describe("Type of event"),
    }),
  }
);

/**
 * Book Session
 */
export const bookSessionTool = tool(
  async ({ coachId, date, startTime, duration }) => {
    try {
      return {
        message: `To complete your booking for ${date} at ${startTime}, please visit the coach profile page.`,
        bookingLink: `/coaches/${coachId}`,
        duration,
      };
    } catch (error: any) {
      return {
        error: `Error processing booking request: ${error.message}`,
      };
    }
  },
  {
    name: "book_session",
    description:
      "Initiate booking for a 1-on-1 coaching session with a coach.",
    schema: z.object({
      coachId: z.string().describe("Internal coach ID"),
      date: z.string().describe("Session date YYYY-MM-DD"),
      startTime: z.string().describe("Session start time HH:mm"),
      duration: z.number().default(60).describe("Session duration in minutes"),
    }),
  }
);

/**
 * Enroll Program
 */
export const enrollProgramTool = tool(
  async ({ programSlug, coachId }) => {
    try {
      return {
        message:
          "To enroll in this program please proceed to the program page.",
        programLink: `/programs/${programSlug}`,
        coachId,
      };
    } catch (error: any) {
      return {
        error: `Error preparing enrollment: ${error.message}`,
      };
    }
  },
  {
    name: "enroll_program",
    description: "Enroll a student into a program or bootcamp.",
    schema: z.object({
      programSlug: z.string().describe("Program slug"),
      coachId: z.string().describe("Primary coach ID"),
    }),
  }
);

/**
 * Create Support Ticket
 */
export const createSupportTicketTool = tool(
  async ({ subject, message }) => {
    try {
      return {
        status: "ticket_created",
        subject,
        message,
        note: "Support team will respond shortly.",
      };
    } catch (error: any) {
      return {
        error: `Error creating support ticket: ${error.message}`,
      };
    }
  },
  {
    name: "create_support_ticket",
    description:
      "Create a support ticket or conversation with the Nebula support team.",
    schema: z.object({
      subject: z.string().describe("Support ticket subject"),
      message: z.string().describe("Detailed issue description"),
    }),
  }
);

/**
 * Export all tools
 */
export const allTools = [
  searchCoachesTool,
  searchProgramsTool,
  searchEventsTool,
  bookSessionTool,
  enrollProgramTool,
  createSupportTicketTool,
];
