import cron from 'node-cron';
import StatusUpdateService from '../services/statusUpdateService.js';

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
      console.log('⏰ Cron jobs disabled by environment variable');
      return;
    }

    console.log(`⏰ Starting cron jobs with schedule: ${this.cronSchedule}`);
    
    // Event status update job
    const statusUpdateJob = cron.schedule(this.cronSchedule, async () => {
      try {
        console.log('🔄 Running scheduled event status update...');
        await StatusUpdateService.updateEventStatuses();
      } catch (error) {
        console.error('❌ Scheduled status update failed:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TIMEZONE || 'UTC'
    });

    this.jobs.set('statusUpdate', statusUpdateJob);
    statusUpdateJob.start();

    console.log('✅ Cron jobs started successfully');

    // Optional: Run once on startup to clean up any missed updates
    if (process.env.RUN_STATUS_UPDATE_ON_STARTUP !== 'false') {
      setTimeout(async () => {
        try {
          console.log('🚀 Running initial status update on startup...');
          await StatusUpdateService.updateEventStatuses();
        } catch (error) {
          console.error('❌ Initial status update failed:', error);
        }
      }, 5000); // Wait 5 seconds after startup
    }
  }

  /**
   * Stop all cron jobs
   */
  stopJobs() {
    console.log('⏹️ Stopping all cron jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
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
      console.log(`🔄 Restarted job: ${jobName}`);
      return true;
    }
    return false;
  }
}

// Create singleton instance
const cronJobManager = new CronJobManager();

export default cronJobManager;
