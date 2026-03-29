import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_INDEX_NAME: z.string().min(1).default("nebula-ai-index"),
  STRIPE_SECRET_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables in @nebula/integrations:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
