const amqp = require('amqplib');

class ImageEventConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange('image_events', 'topic', { durable: true });

      // Declare queue for auth service
      const queueResult = await this.channel.assertQueue('auth_image_events', { durable: true });

      // Bind to profile image events
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.profile');

      console.log('✅ Auth service connected to RabbitMQ image events');

      // Start consuming messages
      this.consumeMessages(queueResult.queue);

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      throw error;
    }
  }

  async consumeMessages(queueName) {
    try {
      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log('📥 Received image event:', content.event_type);

            // Handle different event types
            if (content.event_type === 'image_uploaded') {
              await this.handleImageUploaded(content.data);
            }

            // Acknowledge the message
            this.channel.ack(msg);

          } catch (error) {
            console.error('❌ Error processing message:', error.message);
            // Reject the message and requeue
            this.channel.nack(msg, false, true);
          }
        }
      });

      console.log('👂 Auth service listening for image events...');

    } catch (error) {
      console.error('❌ Error consuming messages:', error.message);
    }
  }

  async handleImageUploaded(imageData) {
    try {
      console.log('🖼️ Processing profile image upload:', imageData);

      const { entity_id, entity_type, type, url } = imageData;

      // Only process if this is for a user profile
      if (entity_type !== 'user' || !entity_id || type !== 'profile') {
        console.log('⏭️ Skipping non-profile image event');
        return;
      }

      const { User } = require('../models');

      console.log(`📝 Updating user ${entity_id} profile picture: ${url}`);
      await User.update(
        { profile_picture_url: url },
        { where: { id: entity_id } }
      );
      console.log('✅ Profile picture updated successfully');

    } catch (error) {
      console.error('❌ Error handling profile image upload:', error.message);
      // Don't throw - let RabbitMQ handle retry logic
    }
  }

  async close() {
    try {
      if (this.channel) {await this.channel.close();}
      if (this.connection) {await this.connection.close();}
      console.log('🔌 Auth service RabbitMQ connection closed');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error.message);
    }
  }
}

module.exports = new ImageEventConsumer();
