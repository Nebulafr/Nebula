import { NextRequest } from "next/server";
import { agentsService } from "../services/agents.service";
import { agentsSchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

class AgentsController {
  async processAgentRequest(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }
    const user = (request as any).user;

    const payload = agentsSchema.parse(body);

    return await agentsService.processAgentRequest({ ...payload, userId: user.id, userRole: user.role });
  }
}

export const agentsController = new AgentsController();                   
