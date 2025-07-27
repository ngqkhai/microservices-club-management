import { Event } from '../models/event.js';

class StatusUpdateService {
  /**
   * Update events status based on current date
   * - Events past their end_date should be marked as 'completed'
   * - Events that have started (past start_date) but not ended should remain 'published'
   */
  static async updateEventStatuses() {
    try {
      const currentDate = new Date();
      console.log(`🔄 Starting event status update at ${currentDate.toISOString()}`);

      // Debug: Check total events in database
      const totalEvents = await Event.countDocuments();
      console.log(`📊 Total events in database: ${totalEvents}`);

      // Debug: Check published events
      const publishedEvents = await Event.countDocuments({ status: 'published' });
      console.log(`📊 Published events: ${publishedEvents}`);

      // Debug: Check all event statuses
      const allEventsWithStatus = await Event.find(
        {},
        { title: 1, status: 1, end_date: 1, _id: 1 }
      );
      console.log(`📊 All events with their statuses:`, allEventsWithStatus);

      // Debug: Find published events with their end dates
      const publishedEventsWithDates = await Event.find(
        { status: 'published' },
        { title: 1, end_date: 1, status: 1 }
      ).limit(5);
      console.log(`📊 Sample published events:`, publishedEventsWithDates);

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

      console.log(`✅ Updated ${completedResult.modifiedCount} events from 'published' to 'completed'`);

      // Optional: Auto-publish events that have reached their start date
      // (if you want to auto-publish draft events when they start)
      const publishResult = await Event.updateMany(
        {
          status: 'draft',
          start_date: { $lte: currentDate },
          end_date: { $gt: currentDate } // Only if event hasn't ended yet
        },
        {
          $set: { 
            status: 'published',
            updated_at: new Date()
          }
        }
      );

      console.log(`✅ Auto-published ${publishResult.modifiedCount} events from 'draft' to 'published'`);

      const summary = {
        timestamp: currentDate.toISOString(),
        eventsCompleted: completedResult.modifiedCount,
        eventsPublished: publishResult.modifiedCount,
        totalUpdated: completedResult.modifiedCount + publishResult.modifiedCount
      };

      console.log('📊 Status update summary:', summary);
      return summary;

    } catch (error) {
      console.error('❌ Error updating event statuses:', error);
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
      console.error('❌ Error getting events needing update:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for status updates (useful for API endpoint)
   */
  static async triggerManualUpdate() {
    console.log('🔧 Manual event status update triggered');
    return await this.updateEventStatuses();
  }
}

export default StatusUpdateService;
