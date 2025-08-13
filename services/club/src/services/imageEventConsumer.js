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
      
      // Declare queue for club service
      const queueResult = await this.channel.assertQueue('club_image_events', { durable: true });
      
      // Bind to logo and cover image events
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.logo');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.cover');
      
      console.log('✅ Club service connected to RabbitMQ image events');
      
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
      
      console.log('👂 Club service listening for image events...');
      
    } catch (error) {
      console.error('❌ Error consuming messages:', error.message);
    }
  }

  async handleImageUploaded(imageData) {
    try {
      console.log('🖼️ Processing club image upload:', imageData);
      
      const { entity_id, entity_type, type, url } = imageData;
      
      // Only process if this is for a club
      if (entity_type !== 'club' || !entity_id) {
        console.log('⏭️ Skipping non-club image event');
        return;
      }
      
      const { Club } = require('../config/database');
      
      if (type === 'logo') {
        console.log(`📝 Updating club ${entity_id} logo: ${url}`);
        await Club.findByIdAndUpdate(entity_id, { 
          logo_url: url,
          updated_at: new Date()
        });
        console.log('✅ Club logo updated successfully');
        
      } else if (type === 'cover') {
        console.log(`📝 Updating club ${entity_id} cover: ${url}`);
        await Club.findByIdAndUpdate(entity_id, { 
          cover_url: url,
          updated_at: new Date()
        });
        console.log('✅ Club cover updated successfully');
      }
      
    } catch (error) {
      console.error('❌ Error handling club image upload:', error.message);
      // Don't throw - let RabbitMQ handle retry logic
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 Club service RabbitMQ connection closed');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error.message);
    }
  }
}

module.exports = new ImageEventConsumer();
