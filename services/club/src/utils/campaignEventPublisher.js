/**
 * Campaign Event Publisher
 * Publishes campaign and club events to RabbitMQ for inter-service communication
 */
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('./logger');

class CampaignEventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'club_events';
    this.isConnected = false;
    this.serviceName = 'club-service';
  }

  async connect() {
    try {
      if (this.isConnected && this.channel) return;

      const rabbitUrl = config.get('RABBITMQ_URL');
      logger.info('CampaignEventPublisher: Connecting to RabbitMQ...');

      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Setup exchange
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      // Handle connection events
      this.connection.on('close', () => {
        logger.warn('CampaignEventPublisher: Connection closed');
        this.isConnected = false;
      });

      this.connection.on('error', (err) => {
        logger.error('CampaignEventPublisher: Connection error', { error: err.message });
        this.isConnected = false;
      });

      this.isConnected = true;
      logger.info('CampaignEventPublisher: Connected to RabbitMQ');
    } catch (error) {
      logger.error('CampaignEventPublisher: Failed to connect', { error: error.message });
      this.isConnected = false;
    }
  }

  /**
   * Create a standardized event payload
   */
  createEventPayload(eventType, data) {
    return {
      id: uuidv4(),
      type: eventType,
      source: this.serviceName,
      timestamp: new Date().toISOString(),
      correlationId: uuidv4(),
      data,
      metadata: {
        version: '1.0',
        environment: config.get('NODE_ENV')
      }
    };
  }

  /**
   * Publish event to RabbitMQ
   */
  async publish(routingKey, payload) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.channel) {
        logger.warn('CampaignEventPublisher: Channel not available');
        return false;
      }

      const messageBuffer = Buffer.from(JSON.stringify(payload));
      
      const published = this.channel.publish(
        this.exchange,
        routingKey,
        messageBuffer,
        { 
          persistent: true,
          contentType: 'application/json'
        }
      );

      if (published) {
        logger.info('CampaignEventPublisher: Event published', { 
          eventType: routingKey,
          eventId: payload.id
        });
      }

      return published;
    } catch (error) {
      logger.error('CampaignEventPublisher: Failed to publish', { 
        error: error.message,
        routingKey 
      });
      return false;
    }
  }

  // ==================== Club Events ====================

  /**
   * Publish club created event
   */
  async publishClubCreated(club) {
    const payload = this.createEventPayload('club.created', {
      clubId: club._id.toString(),
      name: club.name,
      description: club.description,
      category: club.category,
      managerId: club.manager?.user_id,
      managerName: club.manager?.full_name,
      status: club.status,
      createdBy: club.created_by
    });
    return this.publish('club.created', payload);
  }

  /**
   * Publish club updated event
   */
  async publishClubUpdated(club, changedFields = []) {
    const payload = this.createEventPayload('club.updated', {
      clubId: club._id.toString(),
      name: club.name,
      description: club.description,
      category: club.category,
      status: club.status,
      changedFields
    });
    return this.publish('club.updated', payload);
  }

  /**
   * Publish club deleted event
   */
  async publishClubDeleted(clubId) {
    const payload = this.createEventPayload('club.deleted', {
      clubId: clubId.toString(),
      deletedAt: new Date().toISOString()
    });
    return this.publish('club.deleted', payload);
  }

  /**
   * Publish club member added event
   */
  async publishMemberAdded(membership, club) {
    const payload = this.createEventPayload('club.member.added', {
      clubId: club._id.toString(),
      clubName: club.name,
      userId: membership.user_id,
      userEmail: membership.user_email,
      userFullName: membership.user_full_name,
      role: membership.role,
      status: membership.status
    });
    return this.publish('club.member.added', payload);
  }

  /**
   * Publish club member removed event
   */
  async publishMemberRemoved(userId, clubId, reason = null) {
    const payload = this.createEventPayload('club.member.removed', {
      clubId: clubId.toString(),
      userId,
      reason,
      removedAt: new Date().toISOString()
    });
    return this.publish('club.member.removed', payload);
  }

  // ==================== Campaign Events ====================

  /**
   * Publish campaign created event
   */
  async publishCampaignCreated(campaign) {
    const payload = this.createEventPayload('campaign.created', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      title: campaign.title,
      status: campaign.status,
      createdBy: campaign.created_by
    });
    return this.publish('campaign.created', payload);
  }

  /**
   * Publish campaign published event
   */
  async publishCampaignPublished(campaign) {
    const payload = this.createEventPayload('campaign.published', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      title: campaign.title,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      maxApplications: campaign.max_applications
    });
    return this.publish('campaign.published', payload);
  }

  /**
   * Publish campaign updated event
   */
  async publishCampaignUpdated(campaign, changes = {}) {
    const payload = this.createEventPayload('campaign.updated', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      title: campaign.title,
      status: campaign.status,
      changes
    });
    return this.publish('campaign.updated', payload);
  }

  /**
   * Publish campaign status changed event
   */
  async publishCampaignStatusChanged(campaign, previousStatus) {
    const payload = this.createEventPayload('campaign.status.changed', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      title: campaign.title,
      previousStatus,
      newStatus: campaign.status
    });
    return this.publish('campaign.status.changed', payload);
  }

  /**
   * Publish campaign deleted event
   */
  async publishCampaignDeleted(campaign) {
    const payload = this.createEventPayload('campaign.deleted', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      title: campaign.title
    });
    return this.publish('campaign.deleted', payload);
  }

  /**
   * Publish application submitted event
   */
  async publishApplicationSubmitted(application, campaign) {
    const payload = this.createEventPayload('campaign.application.submitted', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      applicationId: application._id.toString(),
      applicantId: application.user_id,
      campaignTitle: campaign.title
    });
    return this.publish('campaign.application.submitted', payload);
  }

  /**
   * Publish application approved event
   */
  async publishApplicationApproved(application, campaign) {
    const payload = this.createEventPayload('campaign.application.approved', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      applicationId: application._id.toString(),
      applicantId: application.user_id,
      campaignTitle: campaign.title
    });
    return this.publish('campaign.application.approved', payload);
  }

  /**
   * Publish application rejected event
   */
  async publishApplicationRejected(application, campaign, reason = null) {
    const payload = this.createEventPayload('campaign.application.rejected', {
      campaignId: campaign._id.toString(),
      clubId: campaign.club_id.toString(),
      applicationId: application._id.toString(),
      applicantId: application.user_id,
      campaignTitle: campaign.title,
      reason
    });
    return this.publish('campaign.application.rejected', payload);
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
      logger.info('CampaignEventPublisher: Connection closed');
    } catch (error) {
      logger.error('CampaignEventPublisher: Error closing', { error: error.message });
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      exchange: this.exchange
    };
  }
}

module.exports = new CampaignEventPublisher();
