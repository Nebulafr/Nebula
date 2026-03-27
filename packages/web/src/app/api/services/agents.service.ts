import { createAgent, tool, HumanMessage, AIMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { UserRole } from "@/enums";
import { AgentInput } from "@/lib/validations";
import { coachService } from "./coach.service";
import { programService } from "./program.service";
import { eventService } from "./event.service";
import { authService } from "./auth.service";
import { EventType } from "@/types/event";
import { NEBULA_AI_SYSTEM_PROMPT } from "../prompts/nebula-ai";
import { prisma, ConversationType } from "@nebula/database";

/**
 * Service Class for Nebula AI Agent
 */
class AgentsService {
  private readonly model: ChatOpenAI;
  private readonly contextSchema: any;
  private readonly systemPrompt: string;
  private readonly agent: any;

  constructor() {
    this.model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.1,
      maxTokens: 1000,
      timeout: 60000,
    });

    this.contextSchema = z.object({
      userRole: z.nativeEnum(UserRole).optional(),
      userId: z.string().optional()
    });

    this.systemPrompt = NEBULA_AI_SYSTEM_PROMPT;

    this.agent = createAgent({
      model: this.model,
      contextSchema: this.contextSchema,
      systemPrompt: this.systemPrompt,
      tools: [
        this.searchCoachesTool(),
        this.searchProgramsTool(),
        this.searchEventsTool(),
        this.getUserProfileTool(),
      ],
    });
  }

  /**
   * Tool Definitions
   */
  private searchCoachesTool() {
    return tool(
      async (args: { specialty?: string; search?: string; limit?: number }) => this.searchCoaches(args),
      {
        name: "search_coaches",
        description: "Search for coaches based on specialty, price range, or general search terms.",
        schema: z.object({
          specialty: z.string().optional().describe("Specialty or category"),
          search: z.string().optional().describe("General search term"),
          limit: z.number().optional().default(5).describe("Limit the number of results"),
        }),
      }
    );
  }

  private searchProgramsTool() {
    return tool(
      async (args: { category?: string; search?: string; limit?: number }) => this.searchPrograms(args),
      {
        name: "search_programs",
        description: "Search for active programs such as courses or bootcamps by category or keyword.",
        schema: z.object({
          category: z.string().optional().describe("Program category"),
          search: z.string().optional().describe("Search term"),
          limit: z.number().optional().default(5).describe("Limit the number of results"),
        }),
      }
    );
  }

  private searchEventsTool() {
    return tool(
      async (args: { search?: string; eventType?: EventType; limit?: number }) => this.searchEvents(args),
      {
        name: "search_events",
        description: "Search for upcoming Nebula events such as webinars and workshops.",
        schema: z.object({
          search: z.string().optional().describe("Search term"),
          eventType: z.string().optional().describe("Type of event"),
          limit: z.number().optional().default(5).describe("Limit the number of results"),
        }),
      }
    );
  }

  private getUserProfileTool() {
    return tool(
      async (args: { userId: string }) => this.getUserProfile(args),
      {
        name: "get_user_profile",
        description: "Get the profile information of the current user, including their name, email, role, and specific details if they are a coach or student.",
        schema: z.object({
          userId: z.string().describe("User ID"),
        }),
      }
    );
  }

  /**
   * Tool Implementations
   */
  private async searchCoaches({ specialty, search, limit = 5 }: { specialty?: string; search?: string; limit?: number }) {
    try {
      const response = await coachService.getCoaches({
        category: specialty,
        search,
        limit,
      });
      return response.coaches || [];
    } catch (error: any) {
      return { error: `Error searching coaches: ${error.message}` };
    }
  }

  private async searchPrograms({ category, search, limit = 5 }: { category?: string; search?: string; limit?: number }) {
    try {
      const response = await programService.getPrograms({
        category,
        search,
        limit,
      });
      return response.programs || [];
    } catch (error: any) {
      return { error: `Error searching programs: ${error.message}` };
    }
  }

  private async searchEvents({ search, eventType, limit = 5 }: { search?: string; eventType?: EventType; limit?: number }) {
    try {
      const response = await eventService.find({
        search,
        eventType,
        limit,
      });
      return response.events || [];
    } catch (error: any) {
      return { error: `Error searching events: ${error.message}` };
    }
  }

  private async getUserProfile({ userId }: { userId: string }) {
    try {
      const response = await authService.getProfile(userId);
      return response.user || null;
    } catch (error: any) {
      return { error: `Error fetching user profile: ${error.message}` };
    }
  }

  /**
   * Database methods
   */
  private async getOrCreateAiConversation(userId: string) {
    // Find absolute AI conversation for this user
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "AI" as ConversationType,
        participants: {
          some: { userId }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: "AI" as ConversationType,
          title: "Nebula AI",
          participants: {
            create: { userId }
          }
        }
      });
    }

    return conversation;
  }

  private async saveMessage(conversationId: string, content: string, isAi: boolean, userId?: string) {
    return await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          content,
          isAi,
          senderId: isAi ? null : userId
        }
      });

      // Update conversation with last message
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageTime: new Date(),
          updatedAt: new Date(),
        },
      });

      return message;
    });
  }

  private async getConversationHistory(conversationId: string, limit: number = 10) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return messages.reverse().map(msg => {
      if (msg.isAi) {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });
  }

  /**
   * Public API
   */
  public async processAgentRequest(payload: AgentInput & { userId: string }) {
    console.log("Processing agent request:", payload);

    // 1. Get or create AI conversation
    const conversation = await this.getOrCreateAiConversation(payload.userId);

    // 2. Save human message
    await this.saveMessage(conversation.id, payload.message, false, payload.userId);

    // 3. Get history for context
    const history = await this.getConversationHistory(conversation.id);

    // 4. Invoke agent with history
    const response = await this.agent.invoke({
      messages: history
    }, {
      context: {
        userRole: payload.userRole,
        userId: payload.userId,
      }
    });

    const agentContent = response.messages.at(-1)?.content as string || "";
    console.log("Agent response:", agentContent);

    // 5. Save agent response
    await this.saveMessage(conversation.id, agentContent, true);

    return { data: agentContent };
  }
}

export const agentsService = new AgentsService();
