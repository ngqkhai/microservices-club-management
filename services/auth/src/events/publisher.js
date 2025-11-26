const rabbitmqConfig = require('../config/rabbitmq');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

// Event type constants (inline to avoid shared module complexity)
const EventTypes = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_EMAIL_VERIFIED: 'user.email.verified',
  USER_PROFILE_PICTURE_UPDATED: 'user.profile.picture.updated',
};

/**
 * Event Publisher for RabbitMQ messaging
 * Handles all event publishing for the auth service
 */
class EventPublisher {
  constructor() {
    this.rabbitmq = rabbitmqConfig;
    this.serviceName = 'auth-service';
  }

  /**
   * Create a standardized event payload
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   * @param {string} [correlationId] - Optional correlation ID
   * @returns {Object} Standardized event payload
   */
  createEventPayload(eventType, data, correlationId = null) {
    return {
      id: uuidv4(),
      type: eventType,
      source: this.serviceName,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || uuidv4(),
      data,
      metadata: {
        version: '1.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * Publish user created event (after email verification)
   * This event is consumed by club-service and event-service to cache user data
   * @param {Object} user - User object
   */
  async publishUserCreated(user) {
    try {
      const payload = this.createEventPayload(EventTypes.USER_CREATED, {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone || null,
        profilePictureUrl: user.profile_picture_url || null,
        role: user.role,
        createdAt: user.created_at
      });

      await this.rabbitmq.publishEvent(EventTypes.USER_CREATED, payload);

      logger.info('User created event published', { 
        eventId: payload.id,
        userId: user.id,
        email: user.email 
      });
    } catch (error) {
      logger.error('Failed to publish user created event:', error, { userId: user.id });
    }
  }

  /**
   * Publish user updated event (after profile update)
   * @param {Object} user - Updated user object
   * @param {string[]} [changedFields] - List of changed fields
   */
  async publishUserUpdated(user, changedFields = []) {
    try {
      const payload = this.createEventPayload(EventTypes.USER_UPDATED, {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone || null,
        profilePictureUrl: user.profile_picture_url || null,
        changedFields,
        updatedAt: user.updated_at || new Date().toISOString()
      });

      await this.rabbitmq.publishEvent(EventTypes.USER_UPDATED, payload);

      logger.info('User updated event published', { 
        eventId: payload.id,
        userId: user.id,
        changedFields 
      });
    } catch (error) {
      logger.error('Failed to publish user updated event:', error, { userId: user.id });
    }
  }

  /**
   * Publish user deleted event
   * @param {string} userId - Deleted user ID
   */
  async publishUserDeleted(userId) {
    try {
      const payload = this.createEventPayload(EventTypes.USER_DELETED, {
        userId,
        deletedAt: new Date().toISOString()
      });

      await this.rabbitmq.publishEvent(EventTypes.USER_DELETED, payload);

      logger.info('User deleted event published', { 
        eventId: payload.id,
        userId 
      });
    } catch (error) {
      logger.error('Failed to publish user deleted event:', error, { userId });
    }
  }

  /**
   * Publish user-related events to RabbitMQ (legacy method - kept for compatibility)
   * @param {string} eventType - Type of event (e.g., 'user.registered', 'user.logged_in')
   * @param {Object} eventData - Event data
   */
  async publishUserEvent(eventType, eventData) {
    try {
      const payload = this.createEventPayload(eventType, {
        userId: eventData.userId,
        ...eventData
      });

      await this.rabbitmq.publishEvent(eventType, payload);

      logger.debug('User event published successfully', { 
        eventType, 
        userId: eventData.userId 
      });
    } catch (error) {
      // Log error but don't fail the operation
      logger.error('Failed to publish user event:', error, { eventType, eventData });
    }
  }

  /**
   * Publish email verification event to notification service
   * @param {Object} eventData - Email verification event data
   * @param {string} eventData.userId - User ID
   * @param {string} eventData.email - User email
   * @param {string} eventData.link - Verification link
   * @param {string} eventData.fullName - User's full name
   */
  async publishEmailVerificationEvent(eventData) {
    try {
      const messageId = uuidv4();
      const payload = {
        id: messageId,
        type: 'send.email.verification',
        userId: eventData.userId,
        email: eventData.email,
        link: eventData.link,
        fullName: eventData.fullName,
        timestamp: new Date().toISOString()
      };

      await this.rabbitmq.publishEvent('send.email.verification', payload);

      logger.info('Email verification event published successfully', {
        messageId,
        userId: eventData.userId,
        email: eventData.email
      });
    } catch (error) {
      // Log error but don't fail the registration
      logger.error('Failed to publish email verification event:', error, { 
        userId: eventData.userId,
        email: eventData.email 
      });
    }
  }

  /**
   * Publish password reset email event to notification service
   * @param {Object} eventData - Password reset event data
   * @param {string} eventData.userId - User ID
   * @param {string} eventData.email - User email
   * @param {string} eventData.link - Password reset link
   * @param {string} eventData.fullName - User's full name
   */
  async publishPasswordResetEvent(eventData) {
    try {
      const messageId = uuidv4();
      const payload = {
        id: messageId,
        type: 'send.email.password.reset',
        userId: eventData.userId,
        email: eventData.email,
        link: eventData.link,
        fullName: eventData.fullName,
        timestamp: new Date().toISOString()
      };

      await this.rabbitmq.publishEvent('send.email.password.reset', payload);

      logger.info('Password reset email event published successfully', {
        messageId,
        userId: eventData.userId,
        email: eventData.email
      });
    } catch (error) {
      // Log error but don't fail the password reset request
      logger.error('Failed to publish password reset email event:', error, { 
        userId: eventData.userId,
        email: eventData.email 
      });
    }
  }

  /**
   * Publish authentication events (login, logout, etc.)
   * @param {string} eventType - Type of auth event
   * @param {Object} eventData - Event data
   */
  async publishAuthEvent(eventType, eventData) {
    return this.publishUserEvent(eventType, eventData);
  }

  /**
   * Publish account security events (password changes, etc.)
   * @param {string} eventType - Type of security event
   * @param {Object} eventData - Event data
   */
  async publishSecurityEvent(eventType, eventData) {
    return this.publishUserEvent(eventType, eventData);
  }

  /**
   * Get RabbitMQ connection status
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    try {
      return this.rabbitmq.getStatus();
    } catch (error) {
      logger.error('Failed to get RabbitMQ status:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Test event publishing (for health checks)
   * @returns {boolean} Success status
   */
  async testPublishing() {
    try {
      await this.publishUserEvent('test.event', {
        userId: 'test',
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      logger.error('Event publishing test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EventPublisher(); 