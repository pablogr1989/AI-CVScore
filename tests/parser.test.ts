import { describe, it, expect } from 'vitest';
import { ResumeParser } from '../src/core/parser.js';

describe('ResumeParser', () => {
  const parser = new ResumeParser();

  const validCvMarkdown = `---
basics:
  name: "Juan Pérez"
  label: "Software Engineer"
  email: "juan@example.com"
  phone: "123456789"
  location: "Madrid, España"
  summary: "Perfil profesional con **Markdown**."
work:
  - company: "Tech Corp"
    position: "Senior Dev"
    location: "Remote"
    startDate: "2020"
    endDate: "Actual"
    highlights: ["Logro con **negrita**"]
education: []
skills: []
languages: []
---`;

  it('debería parsear correctamente un CV válido', async () => {
    const result = await parser.parseRaw(validCvMarkdown);
    expect(result.basics.name).toBe('Juan Pérez');
    // Verifica que el markdown se haya convertido a HTML
    expect(result.basics.summary).toContain('<strong>Markdown</strong>');
  });

  it('debería ser robusto contra bloques de código Markdown generados por IA', async () => {
    const wrappedContent = '```markdown\n' + validCvMarkdown + '\n```';
    const result = await parser.parseRaw(wrappedContent);
    expect(result.basics.name).toBe('Juan Pérez');
  });

  it('debería fallar si el esquema de datos es inválido (Zod)', async () => {
    const invalidCv = `---
basics:
  name: "" # Nombre vacío (error segun schema)
---`;
    await expect(parser.parseRaw(invalidCv)).rejects.toThrow();
  });

  it('debería convertir los highlights de experiencia a HTML', async () => {
    const result = await parser.parseRaw(validCvMarkdown);
    expect(result.work[0].highlights[0]).toContain('<strong>negrita</strong>');
  });

  it('debería lanzar un error si el contenido está vacío', async () => {
    await expect(parser.parseRaw('')).rejects.toThrow('El contenido del CV está vacío.');
  });
});