import { useMutation } from "@tanstack/react-query";
import { sendAgentMessage } from "@/actions/agents";
import { handleAndToastError } from "@/lib/error-handler";
import { AgentInput } from "@/lib/validations";

export function useSendAgentMessage() {
    return useMutation({
        mutationFn: (data: AgentInput) => sendAgentMessage(data),
         
        onError: (error: any) => {
            handleAndToastError(error, "Failed to send message to agent.");
        },
    });
}
