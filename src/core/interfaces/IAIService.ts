export interface IAIService {
  /**
   * Genera un CV optimizado basado en la oferta y el perfil.
   */
  generateOptimizedCv(
    systemPrompt: string,
    examples: { role: string; content: string }[],
    userContent: string
  ): Promise<string>;

  /**
   * Valida un CV generado contra una oferta de trabajo.
   */
  validateResume(
    systemPrompt: string,
    userContent: string
  ): Promise<string>;
}