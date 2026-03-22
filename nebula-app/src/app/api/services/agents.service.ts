import { agent } from "../agents/lib";
import { AgentInput } from "@/lib/validations";
import { HumanMessage } from "langchain";

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
    return { data: response.messages.at(-1)?.content };
  }
}

export const agentsService = new AgentsService();
