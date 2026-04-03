export const PINECONE_NAMESPACES = {
  CONVERSATION_MEMORY: 'conversation_memory',
  USER_MEMORY: 'user_memory',
  COACH_PROFILES: 'coach_profiles',
  PROGRAM_EMBEDDINGS: 'program_embeddings',
  PLATFORM_KNOWLEDGE: 'platform_knowledge',
} as const;

export type PineconeNamespace = typeof PINECONE_NAMESPACES[keyof typeof PINECONE_NAMESPACES];
export type VectorNamespace = PineconeNamespace;

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface QueryResult<T = Record<string, any>> {
  id: string;
  score: number;
  metadata: T;
}

export interface FetchResult {
  id: string;
  values?: number[];
  metadata: Record<string, any>;
}

export interface UploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}
