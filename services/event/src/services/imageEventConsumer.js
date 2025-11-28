import amqp from 'amqplib';
import config from '../config/configManager.js';
import logger from '../config/logger.js';

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

      // Declare queue for event service
      const queueResult = await this.channel.assertQueue('event_image_events', { durable: true });

      // Bind to event image events
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event_image');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event_logo');

      logger.info('Event service connected to RabbitMQ image events');

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

      logger.info('Event service listening for image events...');

    } catch (error) {
      logger.error('Error consuming messages', { error: error.message });
    }
  }

  async handleImageUploaded(imageData) {
    try {
      logger.info('Processing event image upload', { imageData });

      const { entity_id, entity_type, type, url } = imageData;

      // Only process if this is for an event
      if (entity_type !== 'event' || !entity_id) {
        logger.debug('Skipping non-event image event');
        return;
      }

      const { Event } = await import('../models/event.js');

      if (type === 'event_image') {
        logger.info('Updating event main image', { eventId: entity_id, url });
        await Event.findByIdAndUpdate(entity_id, {
          event_image_url: url,
          updated_at: new Date()
        });
        logger.info('Event main image updated successfully', { eventId: entity_id });

      } else if (type === 'event_logo') {
        logger.info('Updating event logo', { eventId: entity_id, url });
        await Event.findByIdAndUpdate(entity_id, {
          event_logo_url: url,
          updated_at: new Date()
        });
        logger.info('Event logo updated successfully', { eventId: entity_id });

      } else if (type === 'event') {
        logger.info('Adding gallery image to event', { eventId: entity_id, url });
        await Event.findByIdAndUpdate(entity_id, {
          $push: { images: url },
          updated_at: new Date()
        });
        logger.info('Event gallery image added successfully', { eventId: entity_id });
      }

    } catch (error) {
      logger.error('Error handling event image upload', { error: error.message });
      // Don't throw - let RabbitMQ handle retry logic
    }
  }

  async close() {
    try {
      if (this.channel) {await this.channel.close();}
      if (this.connection) {await this.connection.close();}
      logger.info('Event service RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', { error: error.message });
    }
  }
}

export default new ImageEventConsumer();
