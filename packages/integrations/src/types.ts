export const PINECONE_NAMESPACES = {
  CONVERSATION_MEMORY: 'conversation_memory',
  USER_MEMORY: 'user_memory',
  COACH_PROFILES: 'coach_profiles',
  PROGRAM_EMBEDDINGS: 'program_embeddings',
  PLATFORM_KNOWLEDGE: 'platform_knowledge',
} as const;

export type PineconeNamespace = keyof typeof PINECONE_NAMESPACES;
