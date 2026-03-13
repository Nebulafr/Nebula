import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not defined');
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'nebula-ai-index';

export const PINECONE_NAMESPACES = {
  CONVERSATION_MEMORY: 'conversation_memory',
  USER_MEMORY: 'user_memory',
  COACH_PROFILES: 'coach_profiles',
  PROGRAM_EMBEDDINGS: 'program_embeddings',
  PLATFORM_KNOWLEDGE: 'platform_knowledge',
} as const;

export type PineconeNamespace = keyof typeof PINECONE_NAMESPACES;

/**
 * Get a reference to a Pinecone index with a specific namespace
 */
export const getPineconeIndex = (namespace: valueof<typeof PINECONE_NAMESPACES>) => {
  return pinecone.index(PINECONE_INDEX).namespace(namespace);
};

/**
 * Upsert vectors to a specific namespace
 */
export const upsertVectors = async (
  namespace: valueof<typeof PINECONE_NAMESPACES>,
  vectors: { id: string; values: number[]; metadata?: any }[]
) => {
  const index = getPineconeIndex(namespace);
  return await index.upsert({ records: vectors });
};

/**
 * Query vectors from a specific namespace
 */
export const queryVectors = async (
  namespace: valueof<typeof PINECONE_NAMESPACES>,
  vector: number[],
  topK: number = 5,
  filter?: any
) => {
  const index = getPineconeIndex(namespace);
  return await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  });
};

/**
 * Delete vectors from a specific namespace by ID
 */
export const deleteVectors = async (
  namespace: valueof<typeof PINECONE_NAMESPACES>,
  ids: string[]
) => {
  const index = getPineconeIndex(namespace);
  return await index.deleteMany(ids);
};

type valueof<T> = T[keyof T];
