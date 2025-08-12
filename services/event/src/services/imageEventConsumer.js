import amqp from 'amqplib';

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
      
      // Declare queue for event service
      const queueResult = await this.channel.assertQueue('event_image_events', { durable: true });
      
      // Bind to event image events
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event_image');
      await this.channel.bindQueue(queueResult.queue, 'image_events', 'image.event_logo');
      
      console.log('✅ Event service connected to RabbitMQ image events');
      
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
      
      console.log('👂 Event service listening for image events...');
      
    } catch (error) {
      console.error('❌ Error consuming messages:', error.message);
    }
  }

  async handleImageUploaded(imageData) {
    try {
      console.log('🖼️ Processing event image upload:', imageData);
      
      const { entity_id, entity_type, type, url } = imageData;
      
      // Only process if this is for an event
      if (entity_type !== 'event' || !entity_id) {
        console.log('⏭️ Skipping non-event image event');
        return;
      }
      
      const { Event } = await import('../models/event.js');
      
      if (type === 'event_image') {
        console.log(`📝 Updating event ${entity_id} main image: ${url}`);
        await Event.findByIdAndUpdate(entity_id, { 
          event_image_url: url,
          updated_at: new Date()
        });
        console.log('✅ Event main image updated successfully');
        
      } else if (type === 'event_logo') {
        console.log(`📝 Updating event ${entity_id} logo: ${url}`);
        await Event.findByIdAndUpdate(entity_id, { 
          event_logo_url: url,
          updated_at: new Date()
        });
        console.log('✅ Event logo updated successfully');
        
      } else if (type === 'event') {
        console.log(`📝 Adding gallery image to event ${entity_id}: ${url}`);
        await Event.findByIdAndUpdate(entity_id, { 
          $push: { images: url },
          updated_at: new Date()
        });
        console.log('✅ Event gallery image added successfully');
      }
      
    } catch (error) {
      console.error('❌ Error handling event image upload:', error.message);
      // Don't throw - let RabbitMQ handle retry logic
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 Event service RabbitMQ connection closed');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error.message);
    }
  }
}

export default new ImageEventConsumer();
