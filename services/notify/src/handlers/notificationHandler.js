const Joi = require('joi');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

/**
 * Notification Handler for processing different types of messages
 * Validates incoming messages and routes them to appropriate services
 */
class NotificationHandler {
  constructor() {
    this.messageProcessors = {
      'send.email.verification': this.processEmailVerification.bind(this),
      'send.email.password.reset': this.processPasswordReset.bind(this),
      'send.email.rsvp': this.processRSVP.bind(this),
      'send.email.announcement': this.processAnnouncement.bind(this)
    };

    this.validationSchemas = this.setupValidationSchemas();
  }

  /**
   * Setup Joi validation schemas for different message types
   */
  setupValidationSchemas() {
    return {
      'send.email.verification': Joi.object({
        type: Joi.string().valid('send.email.verification').required(),
        userId: Joi.string().required(),
        email: Joi.string().email().required(),
        link: Joi.string().uri().required(),
        fullName: Joi.string().required(),
        timestamp: Joi.string().isoDate().optional()
      }),

      'send.email.password.reset': Joi.object({
        type: Joi.string().valid('send.email.password.reset').required(),
        userId: Joi.string().required(),
        email: Joi.string().email().required(),
        link: Joi.string().uri().required(),
        fullName: Joi.string().required(),
        timestamp: Joi.string().isoDate().optional()
      }),

      'send.email.rsvp': Joi.object({
        type: Joi.string().valid('send.email.rsvp').required(),
        userId: Joi.string().required(),
        email: Joi.string().email().required(),
        fullName: Joi.string().required(),
        eventName: Joi.string().required(),
        eventDate: Joi.string().required(),
        eventLocation: Joi.string().required(),
        rsvpLink: Joi.string().uri().required(),
        timestamp: Joi.string().isoDate().optional()
      }),

      'send.email.announcement': Joi.object({
        type: Joi.string().valid('send.email.announcement').required(),
        recipients: Joi.array().items(
          Joi.object({
            email: Joi.string().email().required(),
            fullName: Joi.string().required()
          })
        ).min(1).required(),
        title: Joi.string().required(),
        content: Joi.string().required(),
        priority: Joi.string().valid('normal', 'high').default('normal'),
        timestamp: Joi.string().isoDate().optional()
      })
    };
  }

  /**
   * Main message processing entry point
   * @param {Object} message - The message to process
   * @param {Object} rawMessage - Raw RabbitMQ message object
   */
  async processMessage(message, rawMessage) {
    const startTime = Date.now();
    
    try {
      logger.notification('Processing notification message', {
        type: message.type,
        messageId: message.id || 'unknown',
        queue: rawMessage.fields?.routingKey
      });

      // Validate message structure
      this.validateMessage(message);

      // Get the appropriate processor
      const processor = this.messageProcessors[message.type];
      if (!processor) {
        throw new Error(`No processor found for message type: ${message.type}`);
      }

      // Process the message
      const result = await processor(message);

      const processingTime = Date.now() - startTime;
      logger.notification('Message processed successfully', {
        type: message.type,
        messageId: message.id || 'unknown',
        processingTime,
        result: result.success ? 'success' : 'failed'
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Failed to process notification message:', error, {
        type: message.type,
        messageId: message.id || 'unknown',
        processingTime
      });
      throw error;
    }
  }

  /**
   * Validate message against schema
   * @param {Object} message - Message to validate
   */
  validateMessage(message) {
    const messageType = message.type;
    const schema = this.validationSchemas[messageType];

    if (!schema) {
      throw new Error(`No validation schema found for message type: ${messageType}`);
    }

    const { error, value } = schema.validate(message, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => `${detail.path.join('.')}: ${detail.message}`)
        .join(', ');
      
      throw new Error(`Message validation failed: ${errorMessage}`);
    }

    return value;
  }

  /**
   * Process email verification message
   * @param {Object} message - Email verification message
   */
  async processEmailVerification(message) {
    try {
      logger.email('Processing email verification', {
        userId: message.userId,
        email: message.email
      });

      const result = await emailService.sendEmailVerification({
        userId: message.userId,
        email: message.email,
        link: message.link,
        fullName: message.fullName
      });

      logger.email('Email verification processed', {
        userId: message.userId,
        email: message.email,
        messageId: result.messageId,
        success: result.success
      });

      return result;

    } catch (error) {
      logger.error('Failed to process email verification:', error, {
        userId: message.userId,
        email: message.email
      });
      throw error;
    }
  }

  /**
   * Process password reset message
   * @param {Object} message - Password reset message
   */
  async processPasswordReset(message) {
    try {
      logger.email('Processing password reset', {
        userId: message.userId,
        email: message.email
      });

      const result = await emailService.sendPasswordReset({
        userId: message.userId,
        email: message.email,
        link: message.link,
        fullName: message.fullName
      });

      logger.email('Password reset processed', {
        userId: message.userId,
        email: message.email,
        messageId: result.messageId,
        success: result.success
      });

      return result;

    } catch (error) {
      logger.error('Failed to process password reset:', error, {
        userId: message.userId,
        email: message.email
      });
      throw error;
    }
  }

  /**
   * Process RSVP invitation message
   * @param {Object} message - RSVP message
   */
  async processRSVP(message) {
    try {
      logger.email('Processing RSVP invitation', {
        userId: message.userId,
        email: message.email,
        eventName: message.eventName
      });

      const result = await emailService.sendRSVP({
        userId: message.userId,
        email: message.email,
        fullName: message.fullName,
        eventName: message.eventName,
        eventDate: message.eventDate,
        eventLocation: message.eventLocation,
        rsvpLink: message.rsvpLink
      });

      logger.email('RSVP invitation processed', {
        userId: message.userId,
        email: message.email,
        eventName: message.eventName,
        messageId: result.messageId,
        success: result.success
      });

      return result;

    } catch (error) {
      logger.error('Failed to process RSVP invitation:', error, {
        userId: message.userId,
        email: message.email,
        eventName: message.eventName
      });
      throw error;
    }
  }

  /**
   * Process announcement message
   * @param {Object} message - Announcement message
   */
  async processAnnouncement(message) {
    try {
      logger.email('Processing announcement', {
        title: message.title,
        recipientCount: message.recipients.length,
        priority: message.priority
      });

      const results = await emailService.sendAnnouncement({
        recipients: message.recipients,
        title: message.title,
        content: message.content,
        priority: message.priority
      });

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.email('Announcement processed', {
        title: message.title,
        totalRecipients: message.recipients.length,
        successful,
        failed
      });

      return {
        success: failed === 0,
        results,
        stats: { total: message.recipients.length, successful, failed }
      };

    } catch (error) {
      logger.error('Failed to process announcement:', error, {
        title: message.title,
        recipientCount: message.recipients?.length || 0
      });
      throw error;
    }
  }

  /**
   * Get supported message types
   */
  getSupportedMessageTypes() {
    return Object.keys(this.messageProcessors);
  }

  /**
   * Get validation schema for a message type
   * @param {string} messageType - Type of message
   */
  getValidationSchema(messageType) {
    return this.validationSchemas[messageType];
  }

  /**
   * Add new message processor
   * @param {string} messageType - Type of message
   * @param {Function} processor - Processing function
   * @param {Object} schema - Joi validation schema
   */
  addMessageProcessor(messageType, processor, schema) {
    this.messageProcessors[messageType] = processor.bind(this);
    this.validationSchemas[messageType] = schema;
    
    logger.notification('Added new message processor', { messageType });
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      supportedTypes: this.getSupportedMessageTypes(),
      schemasCount: Object.keys(this.validationSchemas).length,
      processorsCount: Object.keys(this.messageProcessors).length
    };
  }
}

module.exports = new NotificationHandler(); 