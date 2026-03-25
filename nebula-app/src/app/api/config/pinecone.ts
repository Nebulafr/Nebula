import { pinecone, PINECONE_INDEX } from '@/lib/providers';
import { VectorNamespace } from '../types/vector-store';

export async function getPineconeIndex(namespace?: VectorNamespace) {
  const index = pinecone.index(PINECONE_INDEX);
  return namespace ? index.namespace(namespace) : index;
}
