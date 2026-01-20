// batch/src/utils/logger.ts
import winston from 'winston';
import path from 'path';

// 環境変数
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const LOG_DIR = process.env.LOG_DIR || './logs';
const NODE_ENV = process.env.NODE_ENV || 'development';

// フォーマット
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// トランスポート設定
const transports: winston.transport[] = [];

if (LOG_TO_FILE) {
  // ファイル出力
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      format
    })
  );
} else {
  // コンソール出力
  transports.push(
    new winston.transports.Console({
      format: NODE_ENV === 'development' 
        ? winston.format.combine(winston.format.colorize(), format)
        : format
    })
  );
}

// ロガー作成
const winstonLogger = winston.createLogger({
  level: 'info',
  transports
});

// 簡易ロガー
export const logger = {
  info: (message: string) => winstonLogger.info(`INFO: ${message}`),
  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      winstonLogger.error(`ERROR: ${message} , ${error.cause}`);
    }
  }
};