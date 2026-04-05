import { vectorDbService } from './vector-db.service.js';
import { openAIService } from './openai.service.js';
import { PINECONE_NAMESPACES, type VectorRecord } from '../types.js';

export class VectorHubService {
  /**
   * Synchronizes a coach profile to Pinecone
   */
  async syncCoachToVector(coach: any): Promise<void> {
    try {
      if (!coach) return;

      // Construct textual representation for embedding
      const specialtiesStr = coach.specialties?.map((s: any) => s.name || s).join(', ') || '';
      const experiencesStr = coach.experiences?.map((e: any) => `${e.role} at ${e.company}`).join('. ') || '';

      const textToEmbed = `
        Coach: ${coach.fullName}
        Title: ${coach.title}
        Bio: ${coach.bio}
        Specialties: ${specialtiesStr}
        Experience: ${experiencesStr}
      `.trim();

      const values = await openAIService.generateEmbeddings(textToEmbed);

      const metadata = vectorDbService.sanitizeMetadata({
        userId: coach.userId,
        fullName: coach.fullName,
        title: coach.title,
        specialties: coach.specialties?.map((s: any) => s.name || s) || [],
        rating: coach.rating || 0,
        hourlyRate: coach.hourlyRate || 0,
        type: 'coach',
      });

      const record: VectorRecord = {
        id: coach.id,
        values,
        metadata,
      };

      await vectorDbService.upsert([record], PINECONE_NAMESPACES.COACH_PROFILES);
      console.log(`Successfully synced coach ${coach.id} to Pinecone`);
    } catch (error) {
      console.error(`Error syncing coach ${coach?.id} to Pinecone:`, error);
    }
  }

  /**
   * Synchronizes a program to Pinecone
   */
  async syncProgramToVector(program: any): Promise<void> {
    try {
      if (!program) return;

      const textToEmbed = `
        Program: ${program.title}
        Category: ${program.category?.name || 'General'}
        Description: ${program.description}
        Objectives: ${program.objectives?.join('. ') || ''}
      `.trim();

      const values = await openAIService.generateEmbeddings(textToEmbed);

      const metadata = vectorDbService.sanitizeMetadata({
        programId: program.id,
        coachId: program.coachId,
        title: program.title,
        category: program.category?.name || 'General',
        price: program.price || 0,
        difficulty: program.difficultyLevel || 'BEGINNER',
        targetAudience: program.targetAudience,
        type: 'program',
      });

      const record: VectorRecord = {
        id: program.id,
        values,
        metadata,
      };

      await vectorDbService.upsert([record], PINECONE_NAMESPACES.PROGRAM_EMBEDDINGS);
      console.log(`Successfully synced program ${program.id} to Pinecone`);
    } catch (error) {
      console.error(`Error syncing program ${program?.id} to Pinecone:`, error);
    }
  }

  /**
   * Performs semantic search for coaches
   */
  async searchCoaches(query: string, limit: number = 5): Promise<any[]> {
    const vector = await openAIService.generateEmbeddings(query);
    const results = await vectorDbService.query(vector, {
      topK: limit,
      namespace: PINECONE_NAMESPACES.COACH_PROFILES,
      includeMetadata: true,
    });

    return results;
  }

  /**
   * Performs semantic search for programs
   */
  async searchPrograms(query: string, limit: number = 5): Promise<any[]> {
    const vector = await openAIService.generateEmbeddings(query);
    const results = await vectorDbService.query(vector, {
      topK: limit,
      namespace: PINECONE_NAMESPACES.PROGRAM_EMBEDDINGS,
      includeMetadata: true,
    });

    return results;
  }

  /**
   * Synchronizes a conversation turn to Pinecone for RAG
   */
  async syncConversationToVector(params: {
    userId: string;
    conversationId: string;
    userContent: string;
    assistantContent: string;
    assistantMessageId: string;
  }): Promise<void> {
    try {
      const { userId, conversationId, userContent, assistantContent, assistantMessageId } = params;

      const textToEmbed = `
        User: ${userContent}
        Assistant: ${assistantContent}
      `.trim();

      const values = await openAIService.generateEmbeddings(textToEmbed);

      const metadata = vectorDbService.sanitizeMetadata({
        userId,
        conversationId,
        messageId: assistantMessageId,
        type: 'conversation_turn',
        timestamp: new Date().toISOString(),
      });

      const record: VectorRecord = {
        id: `conv_${assistantMessageId}`,
        values,
        metadata,
      };

      await vectorDbService.upsert([record], PINECONE_NAMESPACES.CONVERSATION_MEMORY);
      console.log(`Successfully indexed conversation turn ${assistantMessageId} to Pinecone`);
    } catch (error) {
      console.error(`Error indexing conversation turn:`, error);
    }
  }

  /**
   * Performs semantic search for conversation memory (RAG)
   */
  async searchMemory(userId: string, query: string, limit: number = 5): Promise<any[]> {
    try {
      const vector = await openAIService.generateEmbeddings(query);
      const results = await vectorDbService.query(vector, {
        topK: limit,
        namespace: PINECONE_NAMESPACES.CONVERSATION_MEMORY,
        includeMetadata: true,
        filter: {
          userId: { $eq: userId },
        },
      });

      return results;
    } catch (error) {
      console.error(`Error searching conversation memory for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Synchronizes an event to Pinecone
   */
  async syncEventToVector(event: any): Promise<void> {
    try {
      if (!event) return;

      const textToEmbed = `
        Event: ${event.title}
        Type: ${event.eventType}
        Description: ${event.description}
        Date: ${event.date}
        Location: ${event.location || "Online"}
        Tags: ${event.tags?.join(", ") || ""}
      `.trim();

      const values = await openAIService.generateEmbeddings(textToEmbed);

      const metadata = vectorDbService.sanitizeMetadata({
        eventId: event.id,
        title: event.title,
        eventType: event.eventType,
        date: event.date,
        type: "event",
      });

      const record: VectorRecord = {
        id: event.id,
        values,
        metadata,
      };

      await vectorDbService.upsert([record], PINECONE_NAMESPACES.EVENT_EMBEDDINGS);
      console.log(`Successfully synced event ${event.id} to Pinecone`);
    } catch (error) {
      console.error(`Error syncing event ${event?.id} to Pinecone:`, error);
    }
  }
}

export const vectorHubService = new VectorHubService();
