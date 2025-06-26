const rabbitmqConfig = require('../config/rabbitmq');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Event Publisher for RabbitMQ messaging
 * Handles all event publishing for the auth service
 */
class EventPublisher {
  constructor() {
    this.rabbitmq = rabbitmqConfig;
  }

  /**
   * Publish user-related events to RabbitMQ
   * @param {string} eventType - Type of event (e.g., 'user.registered', 'user.logged_in')
   * @param {Object} eventData - Event data
   */
  async publishUserEvent(eventType, eventData) {
    try {
      await this.rabbitmq.publishEvent(eventType, {
        id: uuidv4(),
        type: eventType,
        userId: eventData.userId,
        ...eventData
      });

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