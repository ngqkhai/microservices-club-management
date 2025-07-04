#!/usr/bin/env node

/**
 * Quick setup script to create test data for US-015 Leave Event testing
 * Creates a test event and participant for testing leave functionality
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from event service
dotenv.config({ path: '../.env' });

// Import models
import('../src/models/event.js').then(({ Event }) => {
  import('../src/models/participant.js').then(({ Participant }) => {
    setupTestData(Event, Participant);
  });
});

async function setupTestData(Event, Participant) {
  try {
    console.log('🔧 Setting up test data for US-015 Leave Event...\n');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-service';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Test event data
    const testEventId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    const testEventId2 = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
    const testUserId = 'test-user-123';
    
    const testEvents = [
      {
        _id: testEventId,
        title: 'Test Event for Leave Testing',
        description: 'This event is created for testing the leave functionality',
        start_at: new Date('2025-08-01T10:00:00Z'),
        end_at: new Date('2025-08-01T12:00:00Z'),
        location: 'Test Location',
        max_attendees: 50,
        status: 'PUBLISHED',
        club_id: 'test-club-123',
        created_by: 'admin-user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: testEventId2,
        title: 'Test Event for Join Testing',
        description: 'This event is created for testing the join functionality',
        start_at: new Date('2025-08-02T14:00:00Z'),
        end_at: new Date('2025-08-02T16:00:00Z'),
        location: 'Join Test Location',
        max_attendees: 30,
        status: 'PUBLISHED',
        club_id: 'test-club-456',
        created_by: 'admin-user',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Create test events
    for (const eventData of testEvents) {
      const existingEvent = await Event.findById(eventData._id);
      if (!existingEvent) {
        console.log(`📝 Creating test event: ${eventData.title}...`);
        const testEvent = new Event(eventData);
        await testEvent.save();
        console.log(`✅ Created test event: ${eventData._id}`);
      } else {
        console.log(`✅ Test event already exists: ${eventData._id}`);
      }
    }
    
    // Check if participant already exists
    const existingParticipant = await Participant.findOne({
      event_id: testEventId,
      user_id: testUserId
    });
    
    if (!existingParticipant) {
      console.log('👥 Creating test participant...');
      const testParticipant = new Participant({
        event_id: testEventId,
        user_id: testUserId,
        joined_at: new Date()
      });
      
      await testParticipant.save();
      console.log(`✅ User ${testUserId} joined event ${testEventId}`);
    } else {
      console.log(`✅ User ${testUserId} already joined event ${testEventId}`);
    }
    
    console.log('\n🎉 Test data setup complete!');
    console.log('📋 Summary:');
    console.log(`   Event ID 1: ${testEventId} (for leave testing)`);
    console.log(`   Event ID 2: ${testEventId2} (for join testing)`);
    console.log(`   User ID: ${testUserId} (joined event 1)`);
    console.log('\n💡 You can now run the test scripts:');
    console.log('   node test-leave-event.js');
    console.log('   node test-join-event.js');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}
