import cron from 'node-cron';
import StatusUpdateService from '../services/statusUpdateService.js';
import logger from './logger.js';

class CronJobManager {
  constructor() {
    this.jobs = new Map();
    this.isEnabled = process.env.ENABLE_STATUS_CRON !== 'false'; // Default to enabled
    this.cronSchedule = process.env.STATUS_CRON_SCHEDULE || '0 * * * *'; // Default: every hour
  }

  /**
   * Start all cron jobs
   */
  startJobs() {
    if (!this.isEnabled) {
      logger.info('Cron jobs disabled by environment variable');
      return;
    }

    logger.info('Starting cron jobs', { schedule: this.cronSchedule });
    
    // Event status update job
    const statusUpdateJob = cron.schedule(this.cronSchedule, async () => {
      try {
        logger.info('Running scheduled event status update...');
        await StatusUpdateService.updateEventStatuses();
      } catch (error) {
        logger.error('Scheduled status update failed', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: process.env.TIMEZONE || 'UTC'
    });

    this.jobs.set('statusUpdate', statusUpdateJob);
    statusUpdateJob.start();

    logger.info('Cron jobs started successfully');

    // Optional: Run once on startup to clean up any missed updates
    if (process.env.RUN_STATUS_UPDATE_ON_STARTUP !== 'false') {
      setTimeout(async () => {
        try {
          logger.info('Running initial status update on startup...');
          await StatusUpdateService.updateEventStatuses();
        } catch (error) {
          logger.error('Initial status update failed', { error: error.message });
        }
      }, 5000); // Wait 5 seconds after startup
    }
  }

  /**
   * Stop all cron jobs
   */
  stopJobs() {
    logger.info('Stopping all cron jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info('Stopped job', { jobName: name });
    });
    this.jobs.clear();
  }

  /**
   * Get job status
   */
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        scheduled: true
      };
    });
    return {
      enabled: this.isEnabled,
      schedule: this.cronSchedule,
      timezone: process.env.TIMEZONE || 'UTC',
      jobs: status
    };
  }

  /**
   * Restart a specific job
   */
  restartJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.start();
      logger.info('Restarted job', { jobName });
      return true;
    }
    return false;
  }
}

// Create singleton instance
const cronJobManager = new CronJobManager();

export default cronJobManager;
