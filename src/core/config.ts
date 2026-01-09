import { app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isTest = process.env.VITEST === 'true';
const isDev = app ? !app.isPackaged : true;

/**
 * APP_ROOT: Siempre apunta a la raíz del código (el interior del .asar en producción).
 * Usamos path.resolve(__dirname, '..', '..') porque el JS compilado está en dist/core/config.js
 */
export const APP_ROOT = path.resolve(__dirname, '..', '..');

/**
 * EXTERNAL_PATH: Apunta a la carpeta de recursos externos instalada en el sistema.
 */
export const EXTERNAL_PATH = (isDev || isTest || !app)
  ? APP_ROOT
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