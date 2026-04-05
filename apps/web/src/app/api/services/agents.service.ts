import { createAgent, tool, HumanMessage, AIMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { UserRole } from "@/enums";
import { AgentInput } from "@/lib/validations";
import { coachService } from "./coach.service";
import { programService } from "./program.service";
import { eventService } from "./event.service";
import { authService } from "./auth.service";
import { categoryService } from "./category.service";
import { EventType } from "@/types/event";
import { NEBULA_AI_SYSTEM_PROMPT } from "../prompts/nebula-ai";
import { prisma, ConversationType } from "@nebula/database";
import { vectorHubService } from "@nebula/integrations";

export interface AgentResponse {
  message: string;
  isError: boolean;
  data?: any;
}

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
        this.getAllCategoriesTool(),
        this.searchMemoryTool(),
      ],
    });
  }

  /**
   * Tool Definitions
   */
  private searchCoachesTool() {
    return tool(
      async (args: { categoryId?: string; search?: string; limit?: number }) => this.searchCoaches({ specialty: args.categoryId, search: args.search, limit: args.limit }),
      {
        name: "search_coaches",
        description: "Search for coaches based on specialty, price range, or general search terms.",
        schema: z.object({
          categoryId: z.string().optional().describe("Category ID (use get_all_categories tool to find IDs)"),
          search: z.string().optional().describe("General search term"),
          limit: z.number().optional().default(5).describe("Limit the number of results"),
        }),
      }
    );
  }

  private searchProgramsTool() {
    return tool(
      async (args: { categoryId?: string; search?: string; limit?: number }) => this.searchPrograms({ category: args.categoryId, search: args.search, limit: args.limit }),
      {
        name: "search_programs",
        description: "Search for active programs such as courses or bootcamps by category or keyword.",
        schema: z.object({
          categoryId: z.string().optional().describe("Category ID (use get_all_categories tool to find IDs)"),
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

  private getAllCategoriesTool() {
    return tool(
      async () => this.getAllCategories(),
      {
        name: "get_all_categories",
        description: "Get all active categories on the platform. Useful for showing what specialties or fields are available for coaching and programs.",
        schema: z.object({}),
      }
    );
  }

  private searchMemoryTool() {
    return tool(
      async (args: { query: string; limit?: number }, { context }: any) => this.searchMemory({ ...args, userId: context.userId }),
      {
        name: "search_memory",
        description: "Search through previous conversations to recall user interests, goals, and shared information.",
        schema: z.object({
          query: z.string().describe("The semantic search query"),
          limit: z.number().optional().default(5).describe("Number of memories to recall"),
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
        categoryId: specialty,
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
        categoryId: category,
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

  private async getAllCategories() {
    try {
      const response = await categoryService.getAll();
      return response.categories || [];
    } catch (error: any) {
      return { error: `Error fetching categories: ${error.message}` };
    }
  }

  private async searchMemory({ userId, query, limit = 5 }: { userId: string; query: string; limit?: number }) {
    try {
      const results = await vectorHubService.searchMemory(userId, query, limit);
      return results.map((r: any) => ({
        content: r.metadata?.userContent || r.metadata?.assistantContent || "",
        timestamp: r.metadata?.timestamp,
        relevance: r.score,
      }));
    } catch (error: any) {
      return { error: `Error searching memory: ${error.message}` };
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
  public async processAgentRequest(payload: AgentInput & { userId: string }): Promise<AgentResponse> {
    console.log("Processing agent request:", payload);

    // 1. Fetch or create a default conversation for the user to maintain state
    const conversation = await this.getOrCreateAiConversation(payload.userId);

    // 2. Process the user's message through the AI Agent Service.
    // Errors inside the agent are caught there and returned as { isError: true, message: "..." }
    const agentResponse = await this.processAgentMessage(payload);

    const responseText = agentResponse.message;

    // 3. Persist both the user message and the system's response (success or error) to the database
    const [userMsg, assistantMsg] = await Promise.all([
      this.saveMessage(conversation.id, payload.message, false, payload.userId),
      this.saveMessage(conversation.id, responseText, true)
    ]);

    // 4. If the processing was successful (not an error), queue the conversation turn for RAG indexing
    if (userMsg && assistantMsg && !agentResponse.isError) {
      vectorHubService.syncConversationToVector({
        conversationId: conversation.id,
        userId: payload.userId,
        userContent: payload.message,
        assistantContent: assistantMsg.content,
        assistantMessageId: assistantMsg.id,
      }).catch((err: any) => console.error('Background indexing failed', err));
    }

    // 5. Return the agent's response to the caller
    return agentResponse;
  }

  /**
   * Internal Agent Processing
   */
  private async processAgentMessage(payload: AgentInput & { userId: string }): Promise<AgentResponse> {
    try {
      // Get history for context
      const conversation = await this.getOrCreateAiConversation(payload.userId);
      const history = await this.getConversationHistory(conversation.id);

      // Create the current message with embedded context
      const currentMessage = new HumanMessage({
        content: `${payload.message}\n\n[Context - UserID: ${payload.userId}, Role: ${payload.userRole}]`
      });

      // Combine history with current message
      const messages = [...history, currentMessage];

      // Invoke agent with full history including current turn
      const response = await this.agent.invoke({
        messages: messages
      }, {
        context: {
          userRole: payload.userRole,
          userId: payload.userId,
        }
      });

      const agentContent = response.messages.at(-1)?.content as string || "";
      console.log("Agent response:", agentContent);

      return {
        message: agentContent,
        isError: false,
        data: agentContent
      };
    } catch (error: any) {
      console.error("Error in processAgentMessage:", error);
      return {
        message: `I'm sorry, I encountered an error processing your request: ${error.message}`,
        isError: true
      };
    }
  }
}

export const agentsService = new AgentsService();
