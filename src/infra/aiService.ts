import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'node:path';
import { IAIService } from '../core/interfaces/IAIService.js';
import { APP_CONFIG, EXTERNAL_PATH } from '../core/config.js';

export class AiService implements IAIService {
  private client: OpenAI;

  constructor() {
    const envPath = path.join(EXTERNAL_PATH, '.env');
    dotenv.config({ path: envPath });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(`Falta OPENAI_API_KEY en: ${envPath}`);
    }

    this.client = new OpenAI({ apiKey: apiKey });
  }

  async generateOptimizedCv(
    systemPrompt: string,
    examples: { role: 'user' | 'assistant' | 'system'; content: string }[],
    userContent: string
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: APP_CONFIG.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...examples,
          { role: 'user', content: userContent }
        ],
        temperature: APP_CONFIG.ai.defaultTemperature,
      });

      return response.choices[0].message.content || '';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en OpenAI';
      console.error('[AiService] Error:', message);
      throw new Error(`Error OpenAI: ${message}`);
    }
  }

  async validateResume(
    systemPrompt: string,
    userContent: string
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: APP_CONFIG.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: APP_CONFIG.ai.validationTemperature,
      });

      return response.choices[0].message.content || '';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en validación OpenAI';
      console.error('[AiService] Error en validación:', message);
      throw new Error(`Error OpenAI (Validación): ${message}`);
    }
  }
}