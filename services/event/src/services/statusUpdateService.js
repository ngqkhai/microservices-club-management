import { Event } from '../models/event.js';
import logger from '../utils/logger.js';

class StatusUpdateService {
  /**
   * Update events status based on current date
   * - Events past their end_date should be marked as 'completed'
   * - Events that have started (past start_date) but not ended should remain 'published'
   */
  static async updateEventStatuses() {
    try {
      const currentDate = new Date();
      logger.info('Starting event status update', { timestamp: currentDate.toISOString() });

      // Debug: Check total events in database
      const totalEvents = await Event.countDocuments();
      const publishedEvents = await Event.countDocuments({ status: 'published' });

      logger.debug('Event counts', { totalEvents, publishedEvents });

      // Update published events that have ended to completed
      const completedResult = await Event.updateMany(
        {
          status: 'published',
          end_date: { $lt: currentDate }
        },
        {
          $set: {
            status: 'completed',
            updated_at: new Date()
          }
        }
      );

      logger.info('Events marked as completed', { count: completedResult.modifiedCount });

      // Optional: Auto-publish events that have reached their start date
      const publishResult = await Event.updateMany(
        {
          status: 'draft',
          start_date: { $lte: currentDate },
          end_date: { $gt: currentDate }
        },
        {
          $set: {
            status: 'published',
            updated_at: new Date()
          }
        }
      );

      logger.info('Events auto-published', { count: publishResult.modifiedCount });

      const summary = {
        timestamp: currentDate.toISOString(),
        eventsCompleted: completedResult.modifiedCount,
        eventsPublished: publishResult.modifiedCount,
        totalUpdated: completedResult.modifiedCount + publishResult.modifiedCount
      };

      logger.info('Status update summary', summary);
      return summary;

    } catch (error) {
      logger.error('Error updating event statuses', { error: error.message });
      throw error;
    }
  }

  /**
   * Get events that need status updates (for debugging/monitoring)
   */
  static async getEventsNeedingUpdate() {
    try {
      const currentDate = new Date();

      const [expiredPublished, draftReadyToPublish] = await Promise.all([
        // Published events that should be completed
        Event.find({
          status: 'published',
          end_date: { $lt: currentDate }
        }).select('title start_date end_date status').sort({ end_date: -1 }),

        // Draft events ready to be published
        Event.find({
          status: 'draft',
          start_date: { $lte: currentDate },
          end_date: { $gt: currentDate }
        }).select('title start_date end_date status').sort({ start_date: 1 })
      ]);

      return {
        expiredPublished: expiredPublished.length,
        draftReadyToPublish: draftReadyToPublish.length,
        details: {
          expiredPublished,
          draftReadyToPublish
        }
      };
    } catch (error) {
      logger.error('Error getting events needing update', { error: error.message });
      throw error;
    }
  }

  /**
   * Manual trigger for status updates (useful for API endpoint)
   */
  static async triggerManualUpdate() {
    logger.info('Manual event status update triggered');
    return await this.updateEventStatuses();
  }
}

export default StatusUpdateService;
