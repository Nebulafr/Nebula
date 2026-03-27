import { apiPost } from "@/lib/utils";
import { AgentInput } from "@/lib/validations";

export async function sendAgentMessage(data: AgentInput) {
    return apiPost("/agents", data, { timeout: 60000 });
}
