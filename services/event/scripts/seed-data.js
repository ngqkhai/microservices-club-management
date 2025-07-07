import mongoose from 'mongoose';
import { Event } from '../src/models/event.js';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/database.js';

const seedEvents = async () => {
  try {
    console.log('🌱 Starting to seed events...');
    
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('✅ Cleared existing events');

    // Sample events
    const sampleEvents = [
      {
        club_id: 'club_001',
        title: 'Tech Workshop: Introduction to Node.js',
        description: 'Learn the basics of Node.js development in this hands-on workshop.',
        location: 'Room A101, Tech Building',
        start_at: new Date('2024-02-15T10:00:00Z'),
        end_at: new Date('2024-02-15T12:00:00Z'),
        max_attendees: 30,
        status: 'PUBLISHED',
        created_by: 'admin_001'
      },
      {
        club_id: 'club_001',
        title: 'Monthly Club Meeting',
        description: 'Regular monthly meeting to discuss club activities and upcoming events.',
        location: 'Conference Room B',
        start_at: new Date('2024-02-20T14:00:00Z'),
        end_at: new Date('2024-02-20T16:00:00Z'),
        max_attendees: 50,
        status: 'PUBLISHED',
        created_by: 'admin_001'
      },
      {
        club_id: 'club_002',
        title: 'Code Review Session',
        description: 'Review and discuss code best practices with fellow developers.',
        location: 'Online via Zoom',
        start_at: new Date('2024-02-25T18:00:00Z'),
        end_at: new Date('2024-02-25T20:00:00Z'),
        max_attendees: 20,
        status: 'PUBLISHED',
        created_by: 'admin_002'
      }
    ];

    const insertedEvents = await Event.insertMany(sampleEvents);
    console.log('✅ Inserted sample events:', insertedEvents.length);
    
    // Print event IDs for testing
    console.log('\n📋 Event IDs for testing:');
    insertedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}: ${event._id}`);
    });

    await disconnectFromDatabase();
    console.log('\n✅ Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedEvents();
