const amqp = require('amqplib');
const config = require('./index');
const logger = require('./logger');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      const rabbitmqConfig = config.getRabbitMQConfig();
      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();

      // Declare exchange for image events
      await this.channel.assertExchange('image_events', 'topic', { durable: true });

      logger.info('Connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      logger.error('RabbitMQ connection error', { error: error.message });
      throw error;
    }
  }

  async publishImageUploaded(imageData) {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not initialized');
      }

      const message = {
        event_type: 'image_uploaded',
        timestamp: new Date().toISOString(),
        data: imageData
      };

      // Publish to different routing keys based on image type
      const routingKey = `image.${imageData.type}`;

      await this.channel.publish(
        'image_events',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      logger.info('Published image event', { routingKey });
      return true;
    } catch (error) {
      logger.error('Failed to publish image event', { error: error.message });
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {await this.channel.close();}
      if (this.connection) {await this.connection.close();}
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', { error: error.message });
    }
  }
}

module.exports = new RabbitMQService();
