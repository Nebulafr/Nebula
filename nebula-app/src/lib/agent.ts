import { createAgent, createMiddleware } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { UserRole } from "@/enums";

const contextSchema = z.object({
  userRole: z.nativeEnum(UserRole),
});

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0.1,
  maxTokens: 1000,
  timeout: 30,
});

const filterToolsMiddleware = createMiddleware({
  name: "FilterToolsMiddleware",
  contextSchema,
  wrapToolCall: (request, handler) => {
    const userRole = request.runtime.context.userRole;

    return handler({
      ...request,
    });
  },
});

export const agent = createAgent({
  model,
  tools: [],
  middleware: [filterToolsMiddleware],
});
