import express from 'express';
import StatusUpdateService from '../services/statusUpdateService.js';
import cronJobManager from '../utils/cronJobManager.js';
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * @route GET /api/admin/status/events
 * @desc Get events that need status updates
 * @access Admin (requires API Gateway authentication + ADMIN role)
 */
router.get('/api/admin/status/events', async (req, res) => {
  try {
    const result = await StatusUpdateService.getEventsNeedingUpdate();
    res.status(200).json({
      success: true,
      message: 'Events needing status update retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get events needing update',
      error: error.message
    });
  }
});

/**
 * @route POST /api/admin/status/update
 * @desc Manually trigger event status update
 * @access Admin (requires API Gateway authentication + ADMIN role)
 */
router.post('/api/admin/status/update', async (req, res) => {
  try {
    const result = await StatusUpdateService.triggerManualUpdate();
    res.status(200).json({
      success: true,
      message: 'Event status update completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event statuses',
      error: error.message
    });
  }
});

/**
 * @route GET /api/admin/cron/status
 * @desc Get cron job status
 * @access Admin (requires API Gateway authentication + ADMIN role)
 */
router.get('/api/admin/cron/status', async (req, res) => {
  try {
    const status = cronJobManager.getJobStatus();
    res.status(200).json({
      success: true,
      message: 'Cron job status retrieved',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cron job status',
      error: error.message
    });
  }
});

/**
 * @route POST /api/admin/cron/:jobName/restart
 * @desc Restart a specific cron job
 * @access Admin (requires API Gateway authentication + ADMIN role)
 */
router.post('/api/admin/cron/:jobName/restart', async (req, res) => {
  try {
    const { jobName } = req.params;
    const restarted = cronJobManager.restartJob(jobName);

    if (restarted) {
      res.status(200).json({
        success: true,
        message: `Cron job '${jobName}' restarted successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Cron job '${jobName}' not found`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restart cron job',
      error: error.message
    });
  }
});

export { router as adminRoutes };
