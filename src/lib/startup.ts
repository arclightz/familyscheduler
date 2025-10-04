import { jobScheduler } from '@/features/jobs/scheduler';
import { logger } from './logger';

/**
 * Initialize background services on server startup
 */
export function initializeServer() {
  // Only run jobs in production or when explicitly enabled
  const enableJobs =
    process.env.NODE_ENV === 'production' || process.env.ENABLE_JOBS === 'true';

  if (enableJobs) {
    logger.info('Initializing background job scheduler...');
    jobScheduler.start();
  } else {
    logger.info('Background jobs disabled (set ENABLE_JOBS=true to enable in dev)');
  }

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down server...');
    jobScheduler.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
