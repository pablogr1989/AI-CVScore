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

  /**
   * Realiza la validación del CV frente a una oferta de trabajo.
   * Proporciona un análisis crítico y un score de compatibilidad.
   * * @param systemPrompt Contenido del archivo validation-system.md
   * @param userContent Texto que combina la Oferta y el CV generado
   * @returns Promesa con el texto de validación (Markdown)
   */
  async validateResume(
    systemPrompt: string,
    userContent: string
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.3, // Ligero incremento para permitir un feedback más analítico
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('[AiService] Error en validación:', error.message);
      throw new Error(`Error OpenAI (Validación): ${error.message}`);
    }
  }
}