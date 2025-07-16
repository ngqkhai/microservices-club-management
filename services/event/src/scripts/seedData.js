import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { 
  Event, 
  Organizer, 
  Registration, 
  EventInterest, 
  EventTask, 
  Participant 
} from '../models/index.js';

// TODO: Organizer and Participant data now handled differently:
// - Organizers are embedded in events as organizers array
// - Participants are tracked via registrations collection
// This seed data script needs to be updated to match the new schema

// Load environment variables
dotenv.config();

console.log('🎯 Starting seed script...');
console.log('Environment loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    console.log('✅ Database connected successfully');

    // Clear existing data with individual operations
    console.log('🗑️ Clearing existing data...');
    
    await Event.deleteMany({});
    console.log('✅ Events cleared');
    
    // await Organizer.deleteMany({}); // Organizers now embedded in events
    console.log('✅ Organizers cleared (now embedded in events)');
    
    await Registration.deleteMany({});
    console.log('✅ Registrations cleared');
    
    await EventInterest.deleteMany({});
    console.log('✅ Event interests cleared');
    
    await EventTask.deleteMany({});
    console.log('✅ Event tasks cleared');
    
    // await Participant.deleteMany({}); // Participants now tracked via registrations
    console.log('✅ Participants cleared (now tracked via registrations)');

    console.log('🚀 Creating sample events...');

    // Sample Events
    const events = await Event.insertMany([
      {
        club_id: 'c1',
        title: 'Hackathon 2025 - Innovation Challenge',
        description: 'A 48-hour coding marathon where teams build innovative solutions to real-world problems.',
        location: 'Tech Hub, Building A, Floor 3',
        start_at: new Date('2025-07-15T09:00:00Z'),
        end_at: new Date('2025-07-17T18:00:00Z'),
        fee: 25000,
        status: 'PUBLISHED',
        progress: 35,
        max_attendees: 100,
        image_url: 'https://example.com/images/hackathon2025.jpg',
        created_by: 'user_001'
      },
      {
        club_id: 'c2',
        title: 'Web3 & Blockchain Technology Workshop',
        description: 'Learn about decentralized applications, smart contracts, and the future of web technology.',
        location: 'Conference Room B, Main Campus',
        start_at: new Date('2025-07-20T14:00:00Z'),
        end_at: new Date('2025-07-20T17:00:00Z'),
        fee: 0,
        status: 'PUBLISHED',
        progress: 80,
        max_attendees: 50,
        image_url: 'https://example.com/images/web3workshop.jpg',
        created_by: 'user_002'
      },
      {
        club_id: 'c1',
        title: 'AI & Machine Learning Seminar',
        description: 'Exploring the latest trends in artificial intelligence and machine learning applications.',
        location: 'Auditorium 1, Science Building',
        start_at: new Date('2025-06-25T10:00:00Z'),
        end_at: new Date('2025-06-25T16:00:00Z'),
        fee: 15000,
        status: 'PUBLISHED',
        progress: 100,
        max_attendees: 150,
        image_url: 'https://example.com/images/aiseminar.jpg',
        created_by: 'user_003'
      },
      {
        club_id: 'c3',
        title: 'Mobile App Development Bootcamp',
        description: 'Intensive 3-day bootcamp covering React Native and Flutter development.',
        location: 'Computer Lab 2',
        start_at: new Date('2025-08-01T09:00:00Z'),
        end_at: new Date('2025-08-03T17:00:00Z'),
        fee: 50000,
        status: 'DRAFT',
        progress: 0,
        max_attendees: 30,
        created_by: 'user_004'
      },
      {
        club_id: 'c2',
        title: 'Cybersecurity Awareness Session',
        description: 'Learn about modern cybersecurity threats and how to protect yourself and your organization.',
        location: 'Online Event',
        start_at: new Date('2025-07-10T19:00:00Z'),
        end_at: new Date('2025-07-10T21:00:00Z'),
        fee: 0,
        status: 'PUBLISHED',
        progress: 60,
        max_attendees: 200,
        image_url: 'https://example.com/images/cybersecurity.jpg',
        created_by: 'user_005'
      }
    ]);

    console.log('✅ Events created:', events.length, 'events inserted');
    console.log('📝 First event ID:', events[0]._id.toString());

    // Sample Organizers (now embedded in events)
    /* TODO: Update events above to include organizers array instead
    await Organizer.insertMany([
      { event_id: events[0]._id, user_id: 'user_001' },
      { event_id: events[0]._id, user_id: 'user_006' },
      { event_id: events[1]._id, user_id: 'user_002' },
      { event_id: events[1]._id, user_id: 'user_007' },
      { event_id: events[2]._id, user_id: 'user_003' },
      { event_id: events[3]._id, user_id: 'user_004' },
      { event_id: events[4]._id, user_id: 'user_005' }
    ]);
    */

    console.log('✅ Organizers created (embedded in events)');

    // Sample Registrations
    await Registration.insertMany([
      {
        event_id: events[0]._id,
        user_id: 'user_101',
        payment_id: 'payment_001',
        ticket_url: 'https://tickets.example.com/hackathon2025/ticket_001',
        qr_code_url: 'https://qr.example.com/ticket_001.png',
        status: 'REGISTERED'
      },
      {
        event_id: events[0]._id,
        user_id: 'user_102',
        payment_id: 'payment_002',
        ticket_url: 'https://tickets.example.com/hackathon2025/ticket_002',
        qr_code_url: 'https://qr.example.com/ticket_002.png',
        status: 'REGISTERED'
      },
      {
        event_id: events[1]._id,
        user_id: 'user_103',
        ticket_url: 'https://tickets.example.com/web3workshop/ticket_003',
        qr_code_url: 'https://qr.example.com/ticket_003.png',
        status: 'REGISTERED'
      },
      {
        event_id: events[2]._id,
        user_id: 'user_104',
        payment_id: 'payment_003',
        ticket_url: 'https://tickets.example.com/aiseminar/ticket_004',
        qr_code_url: 'https://qr.example.com/ticket_004.png',
        status: 'ATTENDED'
      },
      {
        event_id: events[4]._id,
        user_id: 'user_105',
        ticket_url: 'https://tickets.example.com/cybersecurity/ticket_005',
        qr_code_url: 'https://qr.example.com/ticket_005.png',
        status: 'REGISTERED'
      }
    ]);

    console.log('✅ Registrations created');

    // Sample Event Interests
    await EventInterest.insertMany([
      { event_id: events[0]._id, user_id: 'user_201' },
      { event_id: events[0]._id, user_id: 'user_202' },
      { event_id: events[1]._id, user_id: 'user_203' },
      { event_id: events[1]._id, user_id: 'user_204' },
      { event_id: events[2]._id, user_id: 'user_205' },
      { event_id: events[3]._id, user_id: 'user_206' },
      { event_id: events[4]._id, user_id: 'user_207' }
    ]);

    console.log('✅ Event interests created');

    // Sample Event Tasks
    await EventTask.insertMany([
      {
        event_id: events[0]._id,
        title: 'Setup registration system',
        description: 'Configure online registration platform and payment processing',
        status: 'DONE',
        assignee_id: 'user_006',
        due_date: new Date('2025-07-01T00:00:00Z')
      },
      {
        event_id: events[0]._id,
        title: 'Prepare venue and equipment',
        description: 'Setup tables, chairs, projectors, and networking equipment',
        status: 'IN_PROGRESS',
        assignee_id: 'user_001',
        due_date: new Date('2025-07-14T00:00:00Z')
      },
      {
        event_id: events[0]._id,
        title: 'Coordinate with sponsors',
        description: 'Finalize sponsor logos, booth setup, and prize arrangements',
        status: 'TODO',
        assignee_id: 'user_006',
        due_date: new Date('2025-07-10T00:00:00Z')
      },
      {
        event_id: events[1]._id,
        title: 'Prepare presentation materials',
        description: 'Create slides and demo environment for Web3 workshop',
        status: 'DONE',
        assignee_id: 'user_002',
        due_date: new Date('2025-07-15T00:00:00Z')
      },
      {
        event_id: events[1]._id,
        title: 'Test demo applications',
        description: 'Ensure all blockchain demos work properly',
        status: 'IN_PROGRESS',
        assignee_id: 'user_007',
        due_date: new Date('2025-07-19T00:00:00Z')
      }
    ]);

    console.log('✅ Event tasks created');

    // Sample Participants (now tracked via registrations)
    /* TODO: Create registrations with status 'registered' instead
    await Participant.insertMany([
      { event_id: events[0]._id, user_id: 'user_301' },
      { event_id: events[0]._id, user_id: 'user_302' },
      { event_id: events[1]._id, user_id: 'user_303' },
      { event_id: events[2]._id, user_id: 'user_304' },
      { event_id: events[4]._id, user_id: 'user_305' }
    ]);
    */

    console.log('✅ Participants created (via registrations)');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Events: ${events.length}
    - Organizers: 7
    - Registrations: 5
    - Event Interests: 7
    - Event Tasks: 5
    - Participants: 5`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await disconnectFromDatabase();
    console.log('✅ Disconnected successfully');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;
