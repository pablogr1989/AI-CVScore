import { app, BrowserWindow, ipcMain, shell, dialog, IpcMainInvokeEvent } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGeneration, getRenderedHtml } from './index.js';
import { Logger } from './core/logger.js';
import { AiService } from './infra/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const externalPath = isDev ? path.resolve(__dirname, '..') : process.resourcesPath;
const appPath = isDev ? path.resolve(__dirname, '..') : path.resolve(__dirname, '..');

const logger = new Logger(externalPath);
logger.info('=== INICIO DE APLICACIÓN ===');

const infoPath = path.join(externalPath, 'data', 'info.md');

let aiService: AiService;
try {
  aiService = new AiService(externalPath);
} catch (err: any) {
  logger.error('Error al inicializar AiService', err.message);
}

process.on('uncaughtException', (err: Error) => {
  logger.error('CRITICAL: Uncaught Exception en Main', { message: err.message, stack: err.stack });
});

function ensureDataFiles(): void {
  try {
    const dataDir = path.dirname(infoPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(infoPath)) {
      const defaultInfo = `# Mis Datos\n\nEscribe aquí tu experiencia, skills y formación...`;
      fs.writeFileSync(infoPath, defaultInfo, 'utf-8');
    }
  } catch (err: any) {
    logger.error('Error en ensureDataFiles', err.message);
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
    title: "CV Generation + AI Optimizer"
  });

  const htmlPath = path.join(appPath, 'src', 'renderer', 'index.html');
  win.loadFile(htmlPath).catch((err: Error) => {
    logger.error('Error al ejecutar win.loadFile', err.message);
  });
}

ipcMain.on('log-from-renderer', (_event: any, { level, message, data }: { level: string; message: string; data?: any }) => {
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

ipcMain.handle('save-cv', (_event: IpcMainInvokeEvent, content: string, filePath: string): void => {
  fs.writeFileSync(filePath, content, 'utf-8');
});

ipcMain.handle('load-info', (): string => fs.readFileSync(infoPath, 'utf-8'));
ipcMain.handle('save-info', (_event: IpcMainInvokeEvent, content: string): void => fs.writeFileSync(infoPath, content, 'utf-8'));

ipcMain.handle('generate-cv-ai', async (_event: IpcMainInvokeEvent, jobOffer: string, personalInfo: string, specifications: string): Promise<string> => {
  if (!aiService) throw new Error('El servicio de IA no está configurado correctamente.');

  try {
    const systemPromptPath = path.join(externalPath, 'prompts', 'generation-system.md');
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

    const fewShotsDir = path.join(externalPath, 'few-shots');
    const examples = [
      { role: "user", content: fs.readFileSync(path.join(fewShotsDir, '01-user.md'), 'utf-8') },
      { role: "assistant", content: fs.readFileSync(path.join(fewShotsDir, '01-assistant.md'), 'utf-8') },
      { role: "user", content: fs.readFileSync(path.join(fewShotsDir, '02-user.md'), 'utf-8') },
      { role: "assistant", content: fs.readFileSync(path.join(fewShotsDir, '02-assistant.md'), 'utf-8') },
      { role: "user", content: fs.readFileSync(path.join(fewShotsDir, '03-user.md'), 'utf-8') },
      { role: "assistant", content: fs.readFileSync(path.join(fewShotsDir, '03-assistant.md'), 'utf-8') }
    ];

    const finalUserMessage = `Oferta:\n${jobOffer}\n\nPerfil:\n${personalInfo}\n\nEspecificaciones:\n${specifications}`;
    return await aiService.generateOptimizedCv(systemPrompt, examples, finalUserMessage, ""); 
  } catch (error: any) {
    logger.error('Error cargando prompts o llamando a la IA', error.message);
    throw new Error(`Fallo en la preparación de la IA: ${error.message}`);
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
  return runGeneration(content, templateName, externalPath, targetDir);
});

ipcMain.handle('open-pdf', async (_event: IpcMainInvokeEvent, p: string): Promise<string> => {
  if (!p || !fs.existsSync(p)) return `El archivo no existe: ${p}`;
  try {
    const result = await shell.openPath(p);
    return result || '';
  } catch (err: any) {
    return err.message;
  }
});

ipcMain.handle('render-preview', async (_event: IpcMainInvokeEvent, content: string, templateName: string): Promise<{ success: boolean; html?: string; error?: string }> => {
  try {
    const html = await getRenderedHtml(content, templateName, externalPath);
    return { success: true, html };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  ensureDataFiles();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });