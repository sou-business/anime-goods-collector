// ...existing code...
import winston from 'winston';
import fs from 'fs';
import path from 'path';

const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const LOG_DIR = process.env.LOG_DIR || './logs';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info');

const baseFormat = winston.format.combine(
  winston.format.errors({ stack: true }), // stack 情報を扱う
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  baseFormat,
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.json()
);

const transportsArr: winston.transport[] = [];

if (LOG_TO_FILE) {
  // ディレクトリがなければ作る
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    // ディレクトリ作成失敗はコンソールにフォールバック
    // eslint-disable-next-line no-console
    console.warn('Could not create log directory, falling back to console logging', e);
  }

  transportsArr.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      level: LOG_LEVEL,
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB ローテートしやすく
      maxFiles: 5
    })
  );
} else {
  transportsArr.push(
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: NODE_ENV === 'development' ? consoleFormat : fileFormat
    })
  );
}

const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  transports: transportsArr,
  exitOnError: false
});

// 簡易ロガー
export const logger = {
  info: (message: string, meta?: any) => winstonLogger.info(message, meta),
  warn: (message: string, meta?: any) => winstonLogger.warn(message, meta),
  debug: (message: string, meta?: any) => winstonLogger.debug(message, meta),
  error: (message: string, error?: unknown, meta?: any) => {
    if (error instanceof Error) {
      winstonLogger.error(message, { error: { message: error.message, stack: error.stack, ...(error as any).cause ? { cause: (error as any).cause } : {} }, ...meta });
    } else {
      winstonLogger.error(message, { error, ...meta });
    }
  }
};

export default winstonLogger;