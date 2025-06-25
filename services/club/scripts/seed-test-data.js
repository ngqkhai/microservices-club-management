/**
 * Seed script to populate the database with test data
 * 
 * Usage: 
 * 1. Make sure MongoDB is running
 * 2. Run: node scripts/seed-test-data.js
 */

require('dotenv').config();

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Mock user IDs (would normally come from auth service)
const mockUsers = {
  admin: new ObjectId('60d0fe4f5311236168a109ca'),
  manager1: new ObjectId('60d0fe4f5311236168a109cb'),
  manager2: new ObjectId('60d0fe4f5311236168a109cc'),
  user1: new ObjectId('60d0fe4f5311236168a109cd'),
  user2: new ObjectId('60d0fe4f5311236168a109ce')
};

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club_service';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Define schemas
const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String },
  size: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  logo_url: { type: String },
  website_url: { type: String },
  status: { 
    type: String, 
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE'] 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const membershipSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Club'
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  role: { 
    type: String, 
    required: true,
    enum: ['MANAGER', 'MEMBER'] 
  },
  joined_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const recruitmentRoundSchema = new mongoose.Schema({
  club_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Club'
  },
  title: { type: String, required: true },
  description: { type: String },
  criteria: { type: String },
  review_criteria: { type: mongoose.Schema.Types.Mixed, default: {} },
  quota: { type: Number },
  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['OPEN', 'CLOSED', 'CANCELLED'] 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create models
const Club = mongoose.model('Club', clubSchema);
const Membership = mongoose.model('Membership', membershipSchema);
const RecruitmentRound = mongoose.model('RecruitmentRound', recruitmentRoundSchema);

// Sample data
const clubs = [
  {
    name: 'Tech Club',
    description: 'A club for tech enthusiasts and developers',
    type: 'technical',
    size: 120,
    logo_url: 'https://example.com/tech_logo.png',
    website_url: 'https://techclub.example.com',
    status: 'ACTIVE',
    created_by: mockUsers.admin,
    created_at: new Date('2025-01-15')
  },
  {
    name: 'Music Club',
    description: 'For students who love music and performing arts',
    type: 'cultural',
    size: 85,
    logo_url: 'https://example.com/music_logo.png',
    website_url: 'https://musicclub.example.com',
    status: 'ACTIVE',
    created_by: mockUsers.admin,
    created_at: new Date('2024-11-05')
  },
  {
    name: 'Photography Club',
    description: 'Learn photography skills and techniques',
    type: 'artistic',
    size: 45,
    logo_url: 'https://example.com/photo_logo.png',
    website_url: 'https://photoclub.example.com',
    status: 'ACTIVE',
    created_by: mockUsers.admin,
    created_at: new Date('2025-02-20')
  },
  {
    name: 'Sports Club',
    description: 'Various sports activities and competitions',
    type: 'sports',
    size: 150,
    logo_url: 'https://example.com/sports_logo.png',
    website_url: 'https://sportsclub.example.com',
    status: 'ACTIVE',
    created_by: mockUsers.admin,
    created_at: new Date('2024-09-10')
  },
  {
    name: 'Debate Club',
    description: 'Improve public speaking and debate skills',
    type: 'academic',
    size: 30,
    logo_url: 'https://example.com/debate_logo.png',
    website_url: 'https://debateclub.example.com',
    status: 'INACTIVE',
    created_by: mockUsers.admin,
    created_at: new Date('2025-03-15')
  }
];

// Seed data function
async function seedData() {
  try {
    // Clear existing data
    await Club.deleteMany({});
    await Membership.deleteMany({});
    await RecruitmentRound.deleteMany({});
    
    console.log('Existing data cleared');

    // Insert clubs
    const createdClubs = await Club.insertMany(clubs);
    console.log(`Inserted ${createdClubs.length} clubs`);

    // Create memberships
    const memberships = [];
    
    // Tech Club memberships
    memberships.push({
      club_id: createdClubs[0]._id,
      user_id: mockUsers.manager1,
      role: 'MANAGER',
      joined_at: new Date('2025-01-16')
    });
    
    for (let i = 0; i < 5; i++) {
      memberships.push({
        club_id: createdClubs[0]._id,
        user_id: new ObjectId(), // Random user
        role: 'MEMBER',
        joined_at: new Date()
      });
    }
    
    // Music Club memberships
    memberships.push({
      club_id: createdClubs[1]._id,
      user_id: mockUsers.manager2,
      role: 'MANAGER',
      joined_at: new Date('2024-11-06')
    });
    
    for (let i = 0; i < 3; i++) {
      memberships.push({
        club_id: createdClubs[1]._id,
        user_id: new ObjectId(), // Random user
        role: 'MEMBER',
        joined_at: new Date()
      });
    }
    
    await Membership.insertMany(memberships);
    console.log(`Inserted ${memberships.length} memberships`);

    // Create recruitment rounds
    const recruitments = [
      {
        club_id: createdClubs[0]._id, // Tech Club
        title: 'Spring 2025 Recruitment',
        description: 'Looking for passionate developers to join our tech community',
        criteria: 'Basic programming knowledge required',
        quota: 15,
        start_at: new Date('2025-04-10'),
        end_at: new Date('2025-05-10'),
        status: 'OPEN',
        created_by: mockUsers.manager1
      },
      {
        club_id: createdClubs[0]._id, // Tech Club
        title: 'Fall 2024 Recruitment',
        description: 'Past recruitment for tech enthusiasts',
        criteria: 'Interest in technology',
        quota: 20,
        start_at: new Date('2024-10-01'),
        end_at: new Date('2024-10-30'),
        status: 'CLOSED',
        created_by: mockUsers.manager1
      },
      {
        club_id: createdClubs[1]._id, // Music Club
        title: 'Musicians Wanted',
        description: 'Searching for talented musicians',
        criteria: 'Musical experience preferred',
        quota: 10,
        start_at: new Date('2025-03-15'),
        end_at: new Date('2025-04-15'),
        status: 'OPEN',
        created_by: mockUsers.manager2
      }
    ];
    
    await RecruitmentRound.insertMany(recruitments);
    console.log(`Inserted ${recruitments.length} recruitment rounds`);

    console.log('Database seeded successfully!');
    console.log('\nSample Club IDs for testing:');
    createdClubs.forEach((club, index) => {
      console.log(`${club.name}: ${club._id}`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
connectDB().then(() => {
  seedData();
});
