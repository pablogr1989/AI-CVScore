import puppeteer from 'puppeteer';
import path from 'node:path';

export class PdfEngine {
  async generate(htmlPath: string, pdfPath: string, _basePath: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
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
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error generando PDF';
      console.error('[PdfEngine] Error:', message);
      throw new Error(`Fallo al generar el PDF: ${message}`);
    } finally {
      await browser.close();
    }
  }
}