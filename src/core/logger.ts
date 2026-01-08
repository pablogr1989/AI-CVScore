import winston from 'winston';
import path from 'node:path';

export class Logger {
  private logger: winston.Logger;

  constructor(externalPath: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(externalPath, 'logs', 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(externalPath, 'logs', 'combined.log') }),
      ],
    });
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.logger.info(message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.logger.warn(message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.logger.error(message, data);
  }
}