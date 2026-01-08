import { app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectamos si estamos en Vitest o si el objeto 'app' no existe (entorno Node puro)
const isTest = process.env.VITEST === 'true';
// Si app existe, leemos isPackaged. Si no (como en tests), asumimos modo dev.
const isDev = app ? !app.isPackaged : true;

/**
 * Ruta raíz del proyecto o de recursos empaquetados.
 * En test o dev usamos la ruta relativa al proyecto.
 * process.resourcesPath solo existe en el entorno empaquetado de Electron.
 */
export const EXTERNAL_PATH = (isDev || isTest || !app)
  ? path.resolve(__dirname, '..', '..')
  : process.resourcesPath;

export const APP_CONFIG = {
  isDev,
  isTest,
  paths: {
    data: path.join(EXTERNAL_PATH, 'data'),
    info: path.join(EXTERNAL_PATH, 'data', 'info.md'),
    prompts: path.join(EXTERNAL_PATH, 'prompts'),
    fewShots: path.join(EXTERNAL_PATH, 'few-shots'),
    templates: path.join(EXTERNAL_PATH, 'templates'),
    assets: path.join(EXTERNAL_PATH, 'assets'),
  },
  ai: {
    model: 'gpt-4.1',
    defaultTemperature: 0.2,
    validationTemperature: 0.3,
  },
};