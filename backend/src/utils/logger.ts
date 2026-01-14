import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

// Helper functions for consistent logging
export function logError(message: string, error?: unknown): void {
  if (error instanceof Error) {
    logger.error({ err: error }, message);
  } else {
    logger.error({ err: error }, message);
  }
}

export function logWarn(message: string): void {
  logger.warn(message);
}
