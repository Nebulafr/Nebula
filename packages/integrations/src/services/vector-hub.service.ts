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
}

export const vectorHubService = new VectorHubService();
