import "dotenv/config";

export const env = {
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
};
