import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Pinecone } from '@pinecone-database/pinecone';
import Stripe from "stripe";
import OpenAI from "openai";
import { env } from "@/config/env";

/* --- Prisma (Database) --- */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/* --- Pinecone (Vector Store) --- */

if (!env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is required but not defined in environment variables");
}

export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const PINECONE_INDEX = env.PINECONE_INDEX_NAME || 'nebula-ai-index';

export const PINECONE_NAMESPACES = {
  CONVERSATION_MEMORY: 'conversation_memory',
  USER_MEMORY: 'user_memory',
  COACH_PROFILES: 'coach_profiles',
  PROGRAM_EMBEDDINGS: 'program_embeddings',
  PLATFORM_KNOWLEDGE: 'platform_knowledge',
} as const;

export type PineconeNamespace = keyof typeof PINECONE_NAMESPACES;

/** Get a reference to a Pinecone index with a specific namespace */
export const getPineconeIndex = (namespace: string) => {
  return pinecone.index(PINECONE_INDEX).namespace(namespace);
};

/* --- Stripe (Payments) --- */

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-08-01" as any,
  typescript: true,
});

/* --- OpenAI (AI Service) --- */

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
