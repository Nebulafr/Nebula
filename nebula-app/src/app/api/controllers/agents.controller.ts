import { NextRequest } from "next/server";
import { agentsService } from "../services/agents.service";
import { agentsSchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";
import { UserRole } from "@/enums";

class AgentsController {
  async processAgentRequest(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }
    const user = (request as unknown as { user: { id: string, role: UserRole } }).user;

    const payload = agentsSchema.parse(body);

    return await agentsService.processAgentRequest({ ...payload, userId: user.id, userRole: user.role });
  }
}

export const agentsController = new AgentsController();                   
