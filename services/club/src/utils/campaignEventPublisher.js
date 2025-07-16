/**
 * Campaign Event Publisher
 * Handles publishing campaign events to message queue for inter-service communication
 */

class CampaignEventPublisher {
  
  /**
   * Publish campaign created event
   * @param {Object} campaign - Campaign object
   */
  static async publishCampaignCreated(campaign) {
    const eventData = {
      eventType: 'campaign.created',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      title: campaign.title,
      status: campaign.status,
      createdBy: campaign.created_by,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Publish campaign published event
   * @param {Object} campaign - Campaign object
   */
  static async publishCampaignPublished(campaign) {
    const eventData = {
      eventType: 'campaign.published',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      title: campaign.title,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Publish campaign updated event
   * @param {Object} campaign - Campaign object
   * @param {Object} changes - Changed fields
   */
  static async publishCampaignUpdated(campaign, changes = {}) {
    const eventData = {
      eventType: 'campaign.updated',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      title: campaign.title,
      status: campaign.status,
      changes: changes,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Publish campaign status changed event
   * @param {Object} campaign - Campaign object
   * @param {String} previousStatus - Previous status
   */
  static async publishCampaignStatusChanged(campaign, previousStatus) {
    const eventData = {
      eventType: 'campaign.status.changed',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      title: campaign.title,
      previousStatus: previousStatus,
      newStatus: campaign.status,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Publish campaign deleted event
   * @param {Object} campaign - Campaign object
   */
  static async publishCampaignDeleted(campaign) {
    const eventData = {
      eventType: 'campaign.deleted',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      title: campaign.title,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Publish application submitted event
   * @param {Object} application - Application object
   * @param {Object} campaign - Campaign object
   */
  static async publishApplicationSubmitted(application, campaign) {
    const eventData = {
      eventType: 'campaign.application.submitted',
      campaignId: campaign._id,
      clubId: campaign.club_id,
      applicationId: application._id,
      applicantId: application.user_id,
      campaignTitle: campaign.title,
      timestamp: new Date().toISOString()
    };

    await this.publishEvent('campaign.events', eventData);
  }

  /**
   * Generic event publisher (to be implemented with actual message queue)
   * @param {String} exchange - Event exchange name
   * @param {Object} eventData - Event data
   */
  static async publishEvent(exchange, eventData) {
    try {
      // TODO: Implement actual message queue publishing
      // For now, just log the event
      console.log(`📢 Campaign Event Published to ${exchange}:`, eventData);
      
      // Example implementation with RabbitMQ (to be implemented later):
      /*
      const amqp = require('amqplib');
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
      
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.publish(
        exchange, 
        eventData.eventType, 
        Buffer.from(JSON.stringify(eventData))
      );
      
      await connection.close();
      */
      
      // For development, store events in database for debugging
      if (process.env.NODE_ENV === 'development') {
        await this.storeEventForDebugging(eventData);
      }
      
    } catch (error) {
      console.error('Failed to publish campaign event:', error);
      // Don't throw error - event publishing failures shouldn't break the main flow
    }
  }

  /**
   * Store event in database for debugging (development only)
   * @param {Object} eventData - Event data
   */
  static async storeEventForDebugging(eventData) {
    try {
      // This would store events in a separate collection for debugging
      // Implementation depends on your debugging needs
      console.log('📝 Event stored for debugging:', eventData);
    } catch (error) {
      console.error('Failed to store debug event:', error);
    }
  }

  /**
   * Get event handlers for notification service
   * This provides the mapping of events to notification actions
   */
  static getEventHandlers() {
    return {
      'campaign.created': {
        description: 'Campaign created (draft)',
        notifications: []
      },
      'campaign.published': {
        description: 'Campaign published and active',
        notifications: [
          {
            type: 'club_members',
            title: 'New Recruitment Campaign',
            message: 'A new recruitment campaign has been published for your club'
          }
        ]
      },
      'campaign.updated': {
        description: 'Campaign details updated',
        notifications: [
          {
            type: 'interested_users',
            title: 'Campaign Updated',
            message: 'A recruitment campaign you\'re interested in has been updated'
          }
        ]
      },
      'campaign.status.changed': {
        description: 'Campaign status changed',
        notifications: [
          {
            type: 'club_admins',
            title: 'Campaign Status Changed',
            message: 'Campaign status has been updated'
          }
        ]
      },
      'campaign.application.submitted': {
        description: 'New application submitted',
        notifications: [
          {
            type: 'club_admins',
            title: 'New Application Received',
            message: 'A new application has been submitted for your recruitment campaign'
          }
        ]
      }
    };
  }
}

module.exports = CampaignEventPublisher;
