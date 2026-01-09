import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { APP_CONFIG } from '../core/config.js';

export class PdfEngine {
  async generate(htmlPath: string, pdfPath: string, _basePath: string): Promise<void> {
    // Buscamos el ejecutable de Chromium de forma dinámica
    const executablePath = this.getExecutablePath();

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const url = `file://${path.resolve(htmlPath).replace(/\\/g, '/')}`;
      
      await page.goto(url, { 
        waitUntil: 'networkidle0' 
      });

      await page.pdf({ 
        path: pdfPath, 
        format: 'A4', 
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error generando PDF';
      console.error('[PdfEngine] Error:', message);
      throw new Error(`Fallo al generar el PDF: ${message}`);
    } finally {
      await browser.close();
    }
  }

  /**
   * Determina la ruta del ejecutable de Chromium dependiendo de si la app está empaquetada.
   */
  private getExecutablePath(): string | null {
    if (APP_CONFIG.isDev) return null; // En dev, Puppeteer usa su ruta por defecto

    // En producción (Windows), buscamos en la carpeta extraída por asarUnpack
    const prodPath = path.join(
      process.resourcesPath, 
      'app.asar.unpacked', 
      'node_modules', 
      'puppeteer', 
      '.local-chromium',
      'win64-XXXXXX', // Nota: El nombre de esta carpeta varía según la versión de Puppeteer
      'chrome-win',
      'chrome.exe'
    );

    return fs.existsSync(prodPath) ? prodPath : null;
  }
}