import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'node:path';

export class AiService {
  private client: OpenAI;

  constructor(basePath: string) {
    const envPath = path.join(basePath, '.env');
    dotenv.config({ path: envPath });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(`Falta OPENAI_API_KEY en: ${envPath}`);
    }

    this.client = new OpenAI({ apiKey: apiKey });
  }

  async generateOptimizedCv(
    systemPrompt: string,
    examples: any[],
    userContent: string,
    _unused: string = ""
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          ...examples,
          { role: "user", content: userContent }
        ],
        temperature: 0.2,
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('[AiService] Error:', error.message);
      throw new Error(`Error OpenAI: ${error.message}`);
    }
  }
}