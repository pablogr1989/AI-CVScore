import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { APP_CONFIG } from '../core/config.js';

export class PdfEngine {
  /**
   * Genera el PDF a partir de un archivo HTML físico.
   */
  async generate(htmlPath: string, pdfPath: string, _basePath: string): Promise<void> {
    const executablePath = this.getExecutablePath();

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Convertimos el path absoluto en una URL de archivo para Puppeteer
      const url = `file://${path.resolve(htmlPath).replace(/\\/g, '/')}`;
      
      // Cargamos el archivo físico para que resuelva los estilos locales
      await page.goto(url, { 
        waitUntil: 'networkidle0' 
      });

      await page.pdf({ 
        path: pdfPath, 
        format: 'A4', 
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error generando PDF';
      console.error('[PdfEngine] Error:', message);
      throw new Error(`Fallo al generar el PDF: ${message}`);
    } finally {
      await browser.close();
    }
  }

  private getExecutablePath(): string | null {
    if (APP_CONFIG.isDev) return null;

    const prodPath = path.join(
      process.resourcesPath, 
      'app.asar.unpacked', 
      'node_modules', 
      'puppeteer', 
      '.local-chromium',
      'win64-XXXXXX', 
      'chrome-win',
      'chrome.exe'
    );

    return fs.existsSync(prodPath) ? prodPath : null;
  }
}