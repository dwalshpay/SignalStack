import 'dotenv/config';
import { createApp } from './app.js';
import { logger, logError } from './utils/logger.js';
import { prisma } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

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
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
