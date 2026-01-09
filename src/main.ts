import { app, BrowserWindow, ipcMain, shell, dialog, IpcMainInvokeEvent } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGeneration, getRenderedHtml } from './index.js';
import { Logger } from './core/logger.js';
import { AiService } from './infra/aiService.js';
import { APP_CONFIG, EXTERNAL_PATH, APP_ROOT } from './core/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger(EXTERNAL_PATH);

let aiService: AiService;
try {
  aiService = new AiService();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Error desconocido';
  logger.error('Error al inicializar AiService', { message });
}

process.on('uncaughtException', (err: Error) => {
  logger.error('CRITICAL: Uncaught Exception en Main', { message: err.message, stack: err.stack });
});

function ensureDataFiles(): void {
  try {
    const dataDir = APP_CONFIG.paths.data;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(APP_CONFIG.paths.info)) {
      const defaultInfo = `# Mis Datos\n\nEscribe aquí tu experiencia, skills y formación...`;
      fs.writeFileSync(APP_CONFIG.paths.info, defaultInfo, 'utf-8');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en ficheros de datos';
    logger.error('Error en ensureDataFiles', { message });
  }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400, height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "AI-CVScore"
  });

  const htmlPath = path.join(APP_ROOT, 'src', 'renderer', 'index.html');
  
  win.loadFile(htmlPath).catch((err: Error) => {
    logger.error('Error al ejecutar win.loadFile', { message: err.message, path: htmlPath });
  });
}

ipcMain.on('log-from-renderer', (_event: IpcMainInvokeEvent, { level, message, data }: { level: string; message: string; data?: Record<string, unknown> }) => {
  if (level === 'ERROR') logger.error(`[Renderer] ${message}`, data);
  else logger.info(`[Renderer] ${message}`, data);
});

ipcMain.handle('select-file', async (): Promise<{ content: string; path: string } | null> => {
  const result = await dialog.showOpenDialog({
    title: 'Seleccionar archivo de CV (Markdown)',
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return { content, path: filePath };
});

ipcMain.handle('save-cv', async (_event: IpcMainInvokeEvent, content: string, currentPath: string | null): Promise<string | null> => {
  const result = await dialog.showSaveDialog({
    title: 'Guardar CV (Markdown)',
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    defaultPath: currentPath || 'mi-cv-optimizado.md'
  });

  if (result.canceled || !result.filePath) return null;

  try {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return result.filePath;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al escribir archivo';
    logger.error('Error en save-cv handler', { message });
    throw err;
  }
});

ipcMain.handle('load-info', (): string => fs.readFileSync(APP_CONFIG.paths.info, 'utf-8'));
ipcMain.handle('save-info', (_event: IpcMainInvokeEvent, content: string): void => fs.writeFileSync(APP_CONFIG.paths.info, content, 'utf-8'));

ipcMain.handle('generate-cv-ai', async (_event: IpcMainInvokeEvent, jobOffer: string, personalInfo: string, specifications: string): Promise<string> => {
  if (!aiService) throw new Error('El servicio de IA no está configurado correctamente.');

  try {
    const systemPromptPath = path.join(APP_CONFIG.paths.prompts, 'generation-system.md');
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

    const examples = [
      { role: "user" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '01-user.md'), 'utf-8') },
      { role: "assistant" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '01-assistant.md'), 'utf-8') },
      { role: "user" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '02-user.md'), 'utf-8') },
      { role: "assistant" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '02-assistant.md'), 'utf-8') },
      { role: "user" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '03-user.md'), 'utf-8') },
      { role: "assistant" as const, content: fs.readFileSync(path.join(APP_CONFIG.paths.fewShots, '03-assistant.md'), 'utf-8') }
    ];

    const finalUserMessage = `Oferta:\n${jobOffer}\n\nPerfil:\n${personalInfo}\n\nEspecificaciones:\n${specifications}`;
    return await aiService.generateOptimizedCv(systemPrompt, examples, finalUserMessage); 
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fallo en IA';
    logger.error('Error cargando prompts o llamando a la IA', { message });
    throw new Error(`Fallo en la preparación de la IA: ${message}`);
  }
});

ipcMain.handle('validate-resume-ai', async (_event: IpcMainInvokeEvent, jobOffer: string, generatedCV: string): Promise<string> => {
  if (!aiService) throw new Error('El servicio de IA no está configurado correctamente.');

  try {
    const systemPromptPath = path.join(APP_CONFIG.paths.prompts, 'validation-system.md');
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

    const finalUserMessage = `OFERTA_DE_TRABAJO:\n${jobOffer}\n\nCV_GENERADO:\n${generatedCV}`;
    return await aiService.validateResume(systemPrompt, finalUserMessage);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fallo en validación IA';
    logger.error('Error en el proceso de validación por IA', { message });
    throw new Error(`Fallo en la validación de la IA: ${message}`);
  }
});

ipcMain.handle('select-directory', async (): Promise<string | null> => {
  const result = await dialog.showOpenDialog({
    title: 'Selecciona la carpeta donde guardar el CV',
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('generate-pdf', (_event: IpcMainInvokeEvent, content: string, templateName: string, targetDir: string): Promise<string> => {
  return runGeneration(content, templateName, EXTERNAL_PATH, targetDir);
});

ipcMain.handle('open-pdf', async (_event: IpcMainInvokeEvent, p: string): Promise<string> => {
  if (!p || !fs.existsSync(p)) return `El archivo no existe: ${p}`;
  try {
    const result = await shell.openPath(p);
    return result || '';
  } catch (err: unknown) {
    return err instanceof Error ? err.message : 'Error abriendo PDF';
  }
});

ipcMain.handle('render-preview', async (_event: IpcMainInvokeEvent, content: string, templateName: string): Promise<{ success: boolean; html?: string; error?: string }> => {
  try {
    const html = await getRenderedHtml(content, templateName, EXTERNAL_PATH);
    return { success: true, html };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en preview';
    return { success: false, error: message };
  }
});

app.whenReady().then(() => {
  ensureDataFiles();
  createWindow();
});

app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit(); 
});