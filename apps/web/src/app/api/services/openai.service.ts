import { openai } from '@nebula/integrations';

export class OpenAIService {
  private readonly defaultModel = 'gpt-4-turbo-preview';
  private readonly defaultEmbeddingModel = 'text-embedding-3-small';

  /**
   * Generate text using OpenAI Chat Completions API
   */
  async generateText(
    prompt: string,
    options: {
      systemPrompt?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<string> {
    const {
      systemPrompt = 'You are a helpful assistant.',
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      throw new Error('Failed to generate text using OpenAI');
    }
  }

  /**
   * Generate embeddings for a given text
   */
  async generateEmbeddings(
    text: string,
    model: string = this.defaultEmbeddingModel,
  ): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model,
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding generation error:', error);
      throw new Error('Failed to generate embeddings using OpenAI');
    }
  }
}

export const openAIService = new OpenAIService();
