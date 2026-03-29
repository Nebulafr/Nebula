import { getPineconeIndex } from '../config/pinecone';
import {
  VectorRecord,
  QueryResult,
  FetchResult,
  VectorNamespace,
} from '../types/vector-store';
import retry from 'async-retry';

class VectorDbService {
  private async getIndex(namespace?: VectorNamespace) {
    const index = await getPineconeIndex();
    return namespace ? index.namespace(namespace) : index;
  }

  async upsert(records: VectorRecord[], namespace?: VectorNamespace): Promise<void> {
    const index = await this.getIndex(namespace);
    await retry(
      async () => {
        return await index.upsert({ records });
      },
      { retries: 3 },
    );
  }

  async query<T = Record<string, any>>(
    vector: number[],
    options: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
      namespace?: VectorNamespace;
    } = {},
  ): Promise<QueryResult<T>[]> {
    const { topK = 10, filter, includeMetadata = true, namespace } = options;
    const index = await this.getIndex(namespace);

    const results = await retry(
      async () => {
        return await index.query({
          vector,
          topK,
          filter,
          includeMetadata,
        });
      },
      { retries: 3 },
    );

    return (
      results.matches?.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: (match.metadata ?? {}) as T,
      })) ?? []
    );
  }

  async deleteById(ids: string[], namespace?: VectorNamespace): Promise<void> {
    const index = await this.getIndex(namespace);
    await retry(
      async () => {
        await index.deleteMany(ids);
      },
      { retries: 3 },
    );
  }

  async fetchByIds(ids: string[], namespace?: VectorNamespace): Promise<FetchResult[]> {
    const index = await this.getIndex(namespace);
    const results = await retry(
      async () => {
        return await index.fetch({ ids });
      },
      { retries: 3 },
    );

    return Object.values(results.records || {}).map((record: any) => ({
      id: record.id,
      values: record.values as number[] | undefined,
      metadata: (record.metadata as Record<string, any>) ?? {},
    }));
  }

  sanitizeMetadata(
    metadata: Record<string, any>,
  ): Record<string, string | number | boolean | string[]> {
    const sanitized: Record<string, string | number | boolean | string[]> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (value === null || value === undefined) continue;

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.filter((v) => typeof v === 'string');
      } else if (value instanceof Date) {
        sanitized[key] = value.getTime();
      }
    }

    return sanitized;
  }
}

export const vectorDbService = new VectorDbService();
export const vectorDBService = vectorDbService; // Maintain backwards compatibility if needed
export default vectorDbService;
