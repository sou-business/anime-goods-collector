import winston from 'winston';

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info');

const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    new winston.transports.Console({ format: consoleFormat })
  ],
  exitOnError: false
});

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => winstonLogger.info(message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => winstonLogger.warn(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => winstonLogger.debug(message, meta),
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    if (error instanceof Error) {
      winstonLogger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          ...('cause' in error ? { cause: (error as { cause?: unknown }).cause } : {}),
        },
        ...meta,
      });
    } else {
      winstonLogger.error(message, { error, ...meta });
    }
  },
};

export default winstonLogger;