import { PINECONE_NAMESPACES } from '@/lib/providers';

export type VectorNamespace = typeof PINECONE_NAMESPACES[keyof typeof PINECONE_NAMESPACES];

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
