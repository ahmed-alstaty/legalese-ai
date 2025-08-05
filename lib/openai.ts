import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured. Please add it to your .env.local file.');
  // Don't throw here to allow the app to start, but operations will fail
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = 'gpt-4o-mini';
export const OPENAI_MAX_TOKENS = 16384;
export const OPENAI_TEMPERATURE = 0.1;

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' };
  } = {}
): Promise<{
  content: string;
  usage: OpenAI.Completions.CompletionUsage | undefined;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: options.model || OPENAI_MODEL,
      messages,
      temperature: options.temperature ?? OPENAI_TEMPERATURE,
      max_tokens: options.max_tokens || OPENAI_MAX_TOKENS,
      response_format: options.response_format,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    return {
      content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This is a simplified estimation for rate limiting purposes
  return Math.ceil(text.length / 4);
}

export function validateTokenLimit(text: string, maxTokens: number = 120000): boolean {
  const estimatedTokens = estimateTokenCount(text);
  return estimatedTokens <= maxTokens;
}