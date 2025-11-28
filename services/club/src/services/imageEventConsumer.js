const amqp = require('amqplib');
const config = require('../config');
const logger = require('../config/logger');

class ImageEventConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      const rabbitmqConfig = config.getRabbitMQConfig();
      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange('image_events', 'topic', { durable: true });

      // Declare queue for club service
      const queueResult = await this.channel.assertQueue('club_image_events', { durable: true });

      // Bind to logo and cover image events
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.logo');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.cover');

      logger.info('Connected to RabbitMQ image events');

      // Start consuming messages
      this.consumeMessages(queueResult.queue);

    } catch (error) {
      logger.error('Failed to connect to RabbitMQ', { error: error.message });
      throw error;
    }
  }

  async consumeMessages(queueName) {
    try {
      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            logger.info('Received image event', { eventType: content.event_type });

            // Handle different event types
            if (content.event_type === 'image_uploaded') {
              await this.handleImageUploaded(content.data);
            }

            // Acknowledge the message
            this.channel.ack(msg);

          } catch (error) {
            logger.error('Error processing message', { error: error.message });
            // Reject the message and requeue
            this.channel.nack(msg, false, true);
          }
        }
      });

      logger.info('Club service listening for image events...');

    } catch (error) {
      logger.error('Error consuming messages', { error: error.message });
    }
  }

  async handleImageUploaded(imageData) {
    try {
      logger.info('Processing club image upload', { imageData });

      const { entity_id, entity_type, type, url } = imageData;

      // Only process if this is for a club
      if (entity_type !== 'club' || !entity_id) {
        logger.debug('Skipping non-club image event');
        return;
      }

      const { Club } = require('../config/database');

      if (type === 'logo') {
        logger.info('Updating club logo', { clubId: entity_id, url });
        await Club.findByIdAndUpdate(entity_id, {
          logo_url: url,
          updated_at: new Date()
        });
        logger.info('Club logo updated successfully', { clubId: entity_id });

      } else if (type === 'cover') {
        logger.info('Updating club cover', { clubId: entity_id, url });
        await Club.findByIdAndUpdate(entity_id, {
          cover_url: url,
          updated_at: new Date()
        });
        logger.info('Club cover updated successfully', { clubId: entity_id });
      }

    } catch (error) {
      logger.error('Error handling club image upload', { error: error.message });
      // Don't throw - let RabbitMQ handle retry logic
    }
  }

  async close() {
    try {
      if (this.channel) {await this.channel.close();}
      if (this.connection) {await this.connection.close();}
      logger.info('Club service RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', { error: error.message });
    }
  }
}

module.exports = new ImageEventConsumer();
