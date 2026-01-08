import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { Resume, ResumeSchema } from '../types/resume.js';
import { Logger } from './logger.js';
import { EXTERNAL_PATH } from './config.js';

const logger = new Logger(EXTERNAL_PATH);

export class ResumeParser {
  async parse(filePath: string): Promise<Resume> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return await this.parseRaw(fileContent);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error crítico leyendo el archivo', { message });
      throw new Error('No se pudo leer el archivo Markdown.');
    }
  }

  async parseRaw(content: string): Promise<Resume> {
    if (!content || content.trim() === '') {
      throw new Error('El contenido del CV está vacío.');
    }

    const sanitizedContent = this.sanitizeMarkdown(content);

    try {
      const { data } = matter(sanitizedContent);
      
      const validation = ResumeSchema.safeParse(data);
      
      if (!validation.success) {
        const errorMsg = validation.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        throw new Error(`Error de validación en el YAML: ${errorMsg}`);
      }

      const resume = validation.data;

      if (resume.basics?.summary) {
        resume.basics.summary = await this.markdownToHtml(resume.basics.summary);
      }

      if (resume.work && Array.isArray(resume.work)) {
        for (let i = 0; i < resume.work.length; i++) {
          const job = resume.work[i];
          if (job.highlights && Array.isArray(job.highlights)) {
            job.highlights = await Promise.all(
              job.highlights.map(async (h) => await this.markdownToHtml(h))
            );
          }
        }
      }

      return resume;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en parseRaw';
      logger.error('Error durante el parseo', { message });
      throw error;
    }
  }

  private sanitizeMarkdown(content: string): string {
    let clean = content.trim();
    clean = clean.replace(/^```[a-z]*\n/i, '');
    clean = clean.replace(/\n```$/g, '');
    return clean;
  }

  private async markdownToHtml(content: string): Promise<string> {
    if (content.trim().startsWith('<p>')) {
      return content.trim();
    }

    try {
      const safeContent = content.replace(/<(\d)/g, '&lt;$1'); 
      const processedContent = await remark()
        .use(html)
        .process(safeContent);
      
      return processedContent.toString().trim();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error convirtiendo markdown';
      logger.error('Error en markdownToHtml', { message });
      return content;
    }
  }
}