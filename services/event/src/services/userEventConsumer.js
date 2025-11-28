/**
 * User Event Consumer for Event Service
 * Consumes user events from auth-service to keep local user data in sync
 *
 * Events handled:
 * - user.created: Log new user
 * - user.updated: Update denormalized user data in registrations
 * - user.deleted: Mark user registrations as inactive
 */

import amqp from 'amqplib';
import { config, logger } from '../config/index.js';
import { Registration } from '../models/registration.js';

class UserEventConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queue = 'event_user_sync_queue';
    this.exchange = 'auth_events';
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async connect() {
    try {
      if (this.isConnected) {return;}

      const rabbitUrl = config.get('RABBITMQ_URL');
      logger.info('UserEventConsumer: Connecting to RabbitMQ...', { queue: this.queue });

      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Setup exchange and queue
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000, // 24 hours
          'x-dead-letter-exchange': 'club_events.dlx'
        }
      });

      // Bind to user events
      const routingKeys = ['user.created', 'user.updated', 'user.deleted'];
      for (const key of routingKeys) {
        await this.channel.bindQueue(this.queue, this.exchange, key);
      }

      // Handle connection events
      this.connection.on('close', () => {
        logger.warn('UserEventConsumer: RabbitMQ connection closed');
        this.isConnected = false;
        this.scheduleReconnect();
      });

      this.connection.on('error', (err) => {
        logger.error('UserEventConsumer: RabbitMQ connection error', { error: err.message });
        this.isConnected = false;
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('UserEventConsumer: Connected to RabbitMQ');

    } catch (error) {
      logger.error('UserEventConsumer: Failed to connect', { error: error.message });
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('UserEventConsumer: Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000);
    this.reconnectAttempts++;

    logger.info(`UserEventConsumer: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    // Use .catch() to prevent unhandled promise rejection from setTimeout
    setTimeout(() => {
      this.connect().catch(err => {
        logger.error('UserEventConsumer: Reconnect failed', { error: err.message });
      });
    }, delay);
  }

  async startConsuming() {
    try {
      await this.connect();

      if (!this.channel) {
        logger.warn('UserEventConsumer: Channel not available, will retry on reconnect');
        return;
      }

      // Prefetch 1 message at a time for reliable processing
      await this.channel.prefetch(1);

      logger.info('UserEventConsumer: Starting to consume messages');

      this.channel.consume(this.queue, async (message) => {
        if (!message) {return;}

        try {
          const content = JSON.parse(message.content.toString());
          const eventType = content.type;

          logger.info('UserEventConsumer: Received event', {
            eventType,
            eventId: content.id,
            userId: content.data?.userId
          });

          // Process based on event type
          switch (eventType) {
            case 'user.created':
              await this.handleUserCreated(content.data);
              break;
            case 'user.updated':
              await this.handleUserUpdated(content.data);
              break;
            case 'user.deleted':
              await this.handleUserDeleted(content.data);
              break;
            default:
              logger.warn('UserEventConsumer: Unknown event type', { eventType });
          }

          // Acknowledge successful processing
          this.channel.ack(message);
          logger.debug('UserEventConsumer: Message acknowledged', { eventId: content.id });

        } catch (error) {
          logger.error('UserEventConsumer: Error processing message', {
            error: error.message,
            stack: error.stack
          });

          // Reject and requeue on failure
          this.channel.nack(message, false, true);
        }
      });

    } catch (error) {
      logger.error('UserEventConsumer: Failed to start consuming', { error: error.message });
    }
  }

  /**
   * Handle user.created event
   */
  async handleUserCreated(data) {
    try {
      const { userId, email } = data; // fullName also available if needed
      logger.info('UserEventConsumer: Processing user.created', { userId, email });
      // No action needed - user data is cached when they register for events
    } catch (error) {
      logger.error('UserEventConsumer: Error handling user.created', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle user.updated event
   * Update denormalized user data in all registrations
   */
  async handleUserUpdated(data) {
    try {
      const { userId, email, fullName, changedFields } = data;

      logger.info('UserEventConsumer: Processing user.updated', { userId, changedFields });

      // Update denormalized user data in registrations
      const updateData = {};
      if (email) {updateData.user_email = email;}
      if (fullName) {updateData.user_name = fullName;}

      if (Object.keys(updateData).length > 0) {
        const result = await Registration.updateMany(
          { user_id: userId },
          { $set: updateData }
        );

        logger.info('UserEventConsumer: Updated registrations', {
          userId,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        });
      }

    } catch (error) {
      logger.error('UserEventConsumer: Error handling user.updated', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle user.deleted event
   * Cancel active registrations for deleted user
   */
  async handleUserDeleted(data) {
    try {
      const { userId } = data;

      logger.info('UserEventConsumer: Processing user.deleted', { userId });

      // Mark active registrations as cancelled
      const result = await Registration.updateMany(
        { user_id: userId, status: 'registered' },
        {
          $set: {
            status: 'cancelled',
            cancellation_reason: 'User account deleted',
            cancelled_at: new Date()
          }
        }
      );

      logger.info('UserEventConsumer: Registrations cancelled', {
        userId,
        modifiedCount: result.modifiedCount
      });

    } catch (error) {
      logger.error('UserEventConsumer: Error handling user.deleted', { error: error.message });
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {await this.channel.close();}
      if (this.connection) {await this.connection.close();}
      this.isConnected = false;
      logger.info('UserEventConsumer: Connection closed');
    } catch (error) {
      logger.error('UserEventConsumer: Error closing connection', { error: error.message });
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      queue: this.queue,
      exchange: this.exchange,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default new UserEventConsumer();

