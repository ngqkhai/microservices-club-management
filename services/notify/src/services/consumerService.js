const rabbitmqConfig = require('../config/rabbitmq');
const notificationHandler = require('../handlers/notificationHandler');
const logger = require('../config/logger');

/**
 * Consumer Service for managing RabbitMQ message consumption
 * Handles multiple queues and consumer lifecycle management
 */
class ConsumerService {
  constructor() {
    this.consumers = new Map();
    this.isRunning = false;
    this.stats = {
      messagesProcessed: 0,
      messagesFailed: 0,
      consumerCount: 0,
      startTime: null
    };
  }

  /**
   * Start all consumers for notification queues
   */
  async startConsumers() {
    try {
      if (this.isRunning) {
        logger.queue('Consumers already running');
        return;
      }

      logger.queue('Starting notification consumers...');

      // Connect to RabbitMQ
      await rabbitmqConfig.connect();

      // Start consumers for each queue
      const queues = rabbitmqConfig.queues;

      for (const [queueType, queueName] of Object.entries(queues)) {
        await this.startConsumer(queueName, queueType);
      }

      this.isRunning = true;
      this.stats.startTime = new Date();
      this.stats.consumerCount = this.consumers.size;

      logger.queue('All notification consumers started successfully', {
        consumerCount: this.stats.consumerCount,
        queues: Object.values(queues)
      });

    } catch (error) {
      logger.error('Failed to start consumers:', error);
      throw error;
    }
  }

  /**
   * Start a consumer for a specific queue
   * @param {string} queueName - Name of the queue
   * @param {string} queueType - Type of queue (for logging)
   */
  async startConsumer(queueName, queueType) {
    try {
      logger.queue(`Starting consumer for queue: ${queueName}`, { queueType });

      const consumerTag = await rabbitmqConfig.consume(
        queueName,
        this.createMessageHandler(queueName, queueType),
        {
          noAck: false // Enable manual acknowledgment
        }
      );

      this.consumers.set(queueName, {
        consumerTag,
        queueType,
        startTime: new Date(),
        messagesProcessed: 0,
        messagesFailed: 0
      });

      logger.queue(`Consumer started for queue: ${queueName}`, {
        consumerTag,
        queueType
      });

    } catch (error) {
      logger.error(`Failed to start consumer for queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Create message handler for a specific queue
   * @param {string} queueName - Name of the queue
   * @param {string} queueType - Type of queue
   */
  createMessageHandler(queueName, queueType) {
    return async (message, rawMessage) => {
      const startTime = Date.now();

      try {
        logger.queue('Received message', {
          queue: queueName,
          queueType,
          messageId: message.id || 'unknown',
          type: message.type
        });

        // Process the message using notification handler
        const result = await notificationHandler.processMessage(message, rawMessage);

        // Update statistics
        this.updateConsumerStats(queueName, 'success');
        this.stats.messagesProcessed++;

        const processingTime = Date.now() - startTime;
        logger.queue('Message handled successfully', {
          queue: queueName,
          messageId: message.id || 'unknown',
          processingTime,
          success: result.success
        });

      } catch (error) {
        // Update error statistics
        this.updateConsumerStats(queueName, 'failed');
        this.stats.messagesFailed++;

        const processingTime = Date.now() - startTime;
        logger.error('Message handling failed:', error, {
          queue: queueName,
          messageId: message.id || 'unknown',
          processingTime
        });

        // Re-throw error to trigger RabbitMQ retry logic
        throw error;
      }
    };
  }

  /**
   * Update statistics for a specific consumer
   * @param {string} queueName - Name of the queue
   * @param {string} result - Result type ('success' or 'failed')
   */
  updateConsumerStats(queueName, result) {
    const consumer = this.consumers.get(queueName);
    if (consumer) {
      if (result === 'success') {
        consumer.messagesProcessed++;
      } else {
        consumer.messagesFailed++;
      }
    }
  }

  /**
   * Stop all consumers
   */
  async stopConsumers() {
    try {
      if (!this.isRunning) {
        logger.queue('Consumers not running');
        return;
      }

      logger.queue('Stopping all consumers...');

      // Note: RabbitMQ consumers are automatically stopped when connection closes
      // We'll close the connection which will stop all consumers
      await rabbitmqConfig.close();

      this.consumers.clear();
      this.isRunning = false;
      this.stats.consumerCount = 0;

      logger.queue('All consumers stopped successfully');

    } catch (error) {
      logger.error('Failed to stop consumers:', error);
      throw error;
    }
  }

  /**
   * Restart a specific consumer
   * @param {string} queueName - Name of the queue
   */
  async restartConsumer(queueName) {
    try {
      logger.queue(`Restarting consumer for queue: ${queueName}`);

      const consumer = this.consumers.get(queueName);
      if (!consumer) {
        throw new Error(`Consumer not found for queue: ${queueName}`);
      }

      // Remove from tracking
      this.consumers.delete(queueName);

      // Find queue type from rabbitmq config
      const queueType = Object.keys(rabbitmqConfig.queues).find(
        key => rabbitmqConfig.queues[key] === queueName
      );

      // Restart the consumer
      await this.startConsumer(queueName, queueType || 'unknown');

      logger.queue(`Consumer restarted for queue: ${queueName}`);

    } catch (error) {
      logger.error(`Failed to restart consumer for queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Get consumer statistics
   */
  getStats() {
    const consumerStats = {};

    for (const [queueName, consumer] of this.consumers.entries()) {
      consumerStats[queueName] = {
        queueType: consumer.queueType,
        startTime: consumer.startTime,
        messagesProcessed: consumer.messagesProcessed,
        messagesFailed: consumer.messagesFailed,
        uptime: consumer.startTime ? Date.now() - consumer.startTime.getTime() : 0
      };
    }

    return {
      overall: {
        isRunning: this.isRunning,
        startTime: this.stats.startTime,
        uptime: this.stats.startTime ? Date.now() - this.stats.startTime.getTime() : 0,
        messagesProcessed: this.stats.messagesProcessed,
        messagesFailed: this.stats.messagesFailed,
        consumerCount: this.stats.consumerCount
      },
      consumers: consumerStats
    };
  }

  /**
   * Get health status of consumers
   */
  async getHealthStatus() {
    try {
      const rabbitmqHealth = await rabbitmqConfig.healthCheck();

      return {
        healthy: this.isRunning && rabbitmqHealth.healthy,
        isRunning: this.isRunning,
        consumerCount: this.consumers.size,
        rabbitmq: rabbitmqHealth,
        stats: this.getStats()
      };
    } catch (error) {
      return {
        healthy: false,
        isRunning: this.isRunning,
        error: error.message,
        consumerCount: this.consumers.size
      };
    }
  }

  /**
   * Check if consumers are running
   */
  isConsumersRunning() {
    return this.isRunning;
  }

  /**
   * Get list of active queues
   */
  getActiveQueues() {
    return Array.from(this.consumers.keys());
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats.messagesProcessed = 0;
    this.stats.messagesFailed = 0;

    // Reset individual consumer stats
    for (const consumer of this.consumers.values()) {
      consumer.messagesProcessed = 0;
      consumer.messagesFailed = 0;
    }

    logger.queue('Consumer statistics reset');
  }
}

module.exports = new ConsumerService();