import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Standard log format for development
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const metaString = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} [${level}]: ${stack || message} ${metaString}`;
});

export const createLogger = (serviceName: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: serviceName },
    format: combine(
      errors({ stack: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      isProduction ? json() : combine(colorize(), devFormat)
    ),
    transports: [
      new winston.transports.Console()
    ],
  });

  if (isProduction) {
    logger.add(new winston.transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }));
    logger.add(new winston.transports.DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }));
  }

  return logger;
};

// Default global logger fallback
export const logger = createLogger('chat-app-system');
