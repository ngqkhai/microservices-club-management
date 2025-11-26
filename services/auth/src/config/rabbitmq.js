const amqp = require('amqplib');
const logger = require('./logger');
const config = require('./index');

class RabbitMQConfig {
  constructor() {
    this.connection = null;
    this.channel = null;
    const rabbitConfig = config.getRabbitMQConfig();
    this.url = rabbitConfig.url;
    this.exchange = rabbitConfig.exchange;
    this.queue = rabbitConfig.queue;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.channel;
      }

      logger.info('Connecting to RabbitMQ...', { url: this.url });
      
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Create exchange if it doesn't exist
      await this.channel.assertExchange(this.exchange, 'topic', { 
        durable: true 
      });

      // Setup email notification queues that notification service expects
      await this.setupEmailQueues();

      // Handle connection events
      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
        this.reconnect();
      });

      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

      this.isConnected = true;
      logger.info('Successfully connected to RabbitMQ');
      
      return this.channel;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Setup all queues that other services expect
   */
  async setupEmailQueues() {
    try {
      // Email queues (Queue names use underscores, routing keys use dots)
      const emailQueues = [
        { queue: 'send_email_verification', routingKey: 'send.email.verification' },
        { queue: 'send_email_password_reset', routingKey: 'send.email.password.reset' }
      ];

      for (const { queue, routingKey } of emailQueues) {
        await this.channel.assertQueue(queue, { 
          durable: true,
          arguments: {
            'x-message-ttl': 86400000, // 24 hours TTL
            'x-max-retries': 3
          }
        });
        await this.channel.bindQueue(queue, this.exchange, routingKey);
        logger.info(`Email queue setup completed: ${queue} -> ${routingKey}`);
      }

      // User event queues for club-service and event-service
      const userEventQueues = [
        { queue: 'club_user_sync_queue', routingKeys: ['user.created', 'user.updated', 'user.deleted'] },
        { queue: 'event_user_sync_queue', routingKeys: ['user.created', 'user.updated', 'user.deleted'] }
      ];

      for (const { queue, routingKeys } of userEventQueues) {
        await this.channel.assertQueue(queue, { 
          durable: true,
          arguments: {
            'x-message-ttl': 86400000, // 24 hours TTL
            'x-dead-letter-exchange': `${this.exchange}.dlx` // Dead letter exchange
          }
        });
        for (const routingKey of routingKeys) {
          await this.channel.bindQueue(queue, this.exchange, routingKey);
        }
        logger.info(`User sync queue setup completed: ${queue}`);
      }

      // Also setup the general auth events queue for backwards compatibility
      await this.channel.assertQueue(this.queue, { durable: true });
      await this.channel.bindQueue(this.queue, this.exchange, 'auth.*');
      
      logger.info(`Auth events queue setup completed: ${this.queue}`);
    } catch (error) {
      logger.error('Failed to setup queues:', error);
      throw error;
    }
  }

  async reconnect() {
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 5000; // 5 seconds

    while (attempts < maxAttempts && !this.isConnected) {
      try {
        attempts++;
        logger.info(`Attempting to reconnect to RabbitMQ (attempt ${attempts}/${maxAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.connect();
        
        if (this.isConnected) {
          logger.info('Successfully reconnected to RabbitMQ');
          return;
        }
      } catch (error) {
        logger.error(`Reconnection attempt ${attempts} failed:`, error);
      }
    }

    if (!this.isConnected) {
      logger.error(`Failed to reconnect to RabbitMQ after ${maxAttempts} attempts`);
    }
  }

  async publishEvent(routingKey, data) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const message = {
        ...data,
        timestamp: new Date().toISOString(),
        service: 'auth-service'
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
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
        logger.info('Event published successfully', { 
          routingKey, 
          messageId: data.id || 'unknown',
          exchange: this.exchange
        });
      } else {
        logger.warn('Failed to publish event - channel not ready', { routingKey });
      }

      return published;
    } catch (error) {
      logger.error('Error publishing event:', error, { routingKey, data });
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      url: this.url,
      exchange: this.exchange,
      queue: this.queue
    };
  }
}

module.exports = new RabbitMQConfig(); 