import { agent } from "@/lib/agents";
import { AgentInput } from "@/lib/validations";
import { HumanMessage } from "langchain";
import { sendSuccess } from "../utils/send-response";

class AgentsService {
  async processAgentRequest(payload: AgentInput) {
    console.log("Processing agent request:", payload);
    const response = await agent.invoke({
      messages: [new HumanMessage(payload.message)]
    }, {
      context: {
        userRole: payload.userRole,
        userId: payload.userId,
      }
    })
    console.log("Agent response:", response.messages.at(-1)?.content);
    return sendSuccess({ data: response.messages.at(-1)?.content }, "Agent response", 200);
  }
}

export const agentsService = new AgentsService();
