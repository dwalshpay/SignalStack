import 'dotenv/config';
import { createApp } from './app.js';
import { logger, logError } from './utils/logger.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { initializeQueues, shutdownQueues } from './queues/index.js';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Initialize BullMQ queues
    await initializeQueues();

    const app = createApp();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);
  await shutdownQueues();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

main();
