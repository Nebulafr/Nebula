import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { UserRole } from "@/enums";
import { NEBULA_AI_SYSTEM_PROMPT } from "./prompt";

const contextSchema = z.object({
  userRole: z.nativeEnum(UserRole).optional(),
  userId: z.string().optional()
});

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.1,
  maxTokens: 1000,
  timeout: 60000,
});

// export const filterToolsMiddleware = createMiddleware({
//   name: "FilterToolsMiddleware",
//   contextSchema,
//   wrapToolCall: (request, handler) => {
//     const userRole = request.runtime.context.userRole;

//     return handler({
//       ...request,
//     });
//   },
// });

export const agent = createAgent({
  model,
  contextSchema,
  systemPrompt: NEBULA_AI_SYSTEM_PROMPT,
  // tools: [],
  // middleware: [],
});
