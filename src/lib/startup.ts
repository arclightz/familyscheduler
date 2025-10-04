import { jobScheduler } from '@/features/jobs/scheduler';
import { ReminderJobScheduler } from '@/features/jobs/reminder-job';
import { logger } from './logger';

const reminderScheduler = new ReminderJobScheduler();

/**
 * Initialize background services on server startup
 */
export function initializeServer() {
  // Only run jobs in production or when explicitly enabled
  const enableJobs =
    process.env.NODE_ENV === 'production' || process.env.ENABLE_JOBS === 'true';

  if (enableJobs) {
    logger.info('Initializing background job schedulers...');
    jobScheduler.start();
    reminderScheduler.start();
  } else {
    logger.info('Background jobs disabled (set ENABLE_JOBS=true to enable in dev)');
  }

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down server...');
    jobScheduler.stop();
    reminderScheduler.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
