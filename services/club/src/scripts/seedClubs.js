const { connectToDatabase, Club } = require('../config/database');

// Sample club data for testing US007 search functionality
const sampleClubs = [
  {
    name: "Computer Science Club",
    description: "A club for computer science students to learn programming, algorithms, and software development. We organize coding competitions and tech talks.",
    category: "technology",
    location: "Engineering Building, Room 101",
    contact_email: "cs.club@university.edu",
    contact_phone: "+1-555-0101",
    logo_url: "https://example.com/cs-club-logo.png",
    website_url: "https://cs-club.university.edu",
    social_links: {
      facebook: "https://facebook.com/csclub",
      twitter: "https://twitter.com/csclub",
      discord: "https://discord.gg/csclub"
    },
    settings: {
      privacy: "public",
      auto_approve: false,
      max_members: 100
    },
    status: "active",
    created_by: "admin",
    size: 45,
    created_at: new Date("2024-01-15")
  },
  {
    name: "Basketball Club",
    description: "Join us for basketball training, tournaments, and friendly matches. All skill levels welcome! We practice twice a week.",
    category: "sports",
    location: "Sports Complex, Court 1",
    contact_email: "basketball@university.edu",
    contact_phone: "+1-555-0102",
    logo_url: "https://example.com/basketball-logo.png",
    website_url: "https://basketball.university.edu",
    social_links: {
      instagram: "https://instagram.com/basketballclub",
      facebook: "https://facebook.com/basketballclub"
    },
    settings: {
      privacy: "public",
      auto_approve: true,
      max_members: 50
    },
    status: "active",
    created_by: "admin",
    size: 28,
    created_at: new Date("2024-02-01")
  },
  {
    name: "Drama Society",
    description: "Experience the magic of theater! We perform plays, musicals, and organize drama workshops. Perfect for aspiring actors and theater enthusiasts.",
    category: "arts",
    location: "Arts Building, Theater Hall",
    contact_email: "drama@university.edu",
    contact_phone: "+1-555-0103",
    logo_url: "https://example.com/drama-logo.png",
    website_url: "https://drama.university.edu",
    social_links: {
      youtube: "https://youtube.com/dramasociety",
      instagram: "https://instagram.com/dramasociety"
    },
    settings: {
      privacy: "public",
      auto_approve: false,
      max_members: 30
    },
    status: "active",
    created_by: "admin",
    size: 22,
    created_at: new Date("2024-01-20")
  },
  {
    name: "Environmental Action Group",
    description: "Making our campus and community more sustainable! We organize clean-up drives, tree planting, and environmental awareness campaigns.",
    category: "volunteer",
    location: "Student Center, Room 205",
    contact_email: "environmental@university.edu",
    contact_phone: "+1-555-0104",
    logo_url: "https://example.com/environmental-logo.png",
    website_url: "https://environmental.university.edu",
    social_links: {
      facebook: "https://facebook.com/environmentalaction",
      twitter: "https://twitter.com/enviroaction"
    },
    settings: {
      privacy: "public",
      auto_approve: true,
      max_members: 80
    },
    status: "active",
    created_by: "admin",
    size: 35,
    created_at: new Date("2024-01-10")
  },
  {
    name: "International Students Association",
    description: "Connecting students from around the world! We celebrate different cultures, organize cultural festivals, and provide support for international students.",
    category: "cultural",
    location: "International House, Main Hall",
    contact_email: "isa@university.edu",
    contact_phone: "+1-555-0105",
    logo_url: "https://example.com/isa-logo.png",
    website_url: "https://isa.university.edu",
    social_links: {
      facebook: "https://facebook.com/isa",
      instagram: "https://instagram.com/isa",
      whatsapp: "https://chat.whatsapp.com/isa"
    },
    settings: {
      privacy: "public",
      auto_approve: false,
      max_members: 150
    },
    status: "active",
    created_by: "admin",
    size: 67,
    created_at: new Date("2024-01-05")
  },
  {
    name: "Photography Club",
    description: "Capture the world through your lens! We organize photo walks, workshops, and exhibitions. Equipment sharing available for members.",
    category: "arts",
    location: "Media Center, Studio 3",
    contact_email: "photography@university.edu",
    contact_phone: "+1-555-0106",
    logo_url: "https://example.com/photography-logo.png",
    website_url: "https://photography.university.edu",
    social_links: {
      instagram: "https://instagram.com/photographyclub",
      flickr: "https://flickr.com/photographyclub"
    },
    settings: {
      privacy: "public",
      auto_approve: true,
      max_members: 40
    },
    status: "active",
    created_by: "admin",
    size: 31,
    created_at: new Date("2024-02-10")
  },
  {
    name: "Debate and Public Speaking",
    description: "Sharpen your rhetoric and argumentation skills! We participate in inter-university debates and organize public speaking workshops.",
    category: "academic",
    location: "Library, Conference Room A",
    contact_email: "debate@university.edu",
    contact_phone: "+1-555-0107",
    logo_url: "https://example.com/debate-logo.png",
    website_url: "https://debate.university.edu",
    social_links: {
      facebook: "https://facebook.com/debateclub",
      linkedin: "https://linkedin.com/company/debateclub"
    },
    settings: {
      privacy: "public",
      auto_approve: false,
      max_members: 25
    },
    status: "active",
    created_by: "admin",
    size: 18,
    created_at: new Date("2024-02-05")
  },
  {
    name: "Gaming Society",
    description: "Level up your gaming experience! We organize tournaments, game nights, and discussions about video games, board games, and esports.",
    category: "social",
    location: "Student Center, Game Room",
    contact_email: "gaming@university.edu",
    contact_phone: "+1-555-0108",
    logo_url: "https://example.com/gaming-logo.png",
    website_url: "https://gaming.university.edu",
    social_links: {
      discord: "https://discord.gg/gamingsociety",
      twitch: "https://twitch.tv/gamingsociety",
      steam: "https://steamcommunity.com/groups/gamingsociety"
    },
    settings: {
      privacy: "public",
      auto_approve: true,
      max_members: 75
    },
    status: "active",
    created_by: "admin",
    size: 52,
    created_at: new Date("2024-01-25")
  }
];

async function seedClubs() {
  try {
    await connectToDatabase();
    
    // Clear existing clubs (only in development)
    if (process.env.NODE_ENV === 'development') {
      await Club.deleteMany({});
      console.log('🗑️ Cleared existing clubs');
    }
    
    // Insert sample clubs
    const insertedClubs = await Club.insertMany(sampleClubs);
    console.log(`✅ Inserted ${insertedClubs.length} sample clubs`);
    
    // Display inserted clubs
    console.log('📋 Sample clubs created:');
    insertedClubs.forEach((club, index) => {
      console.log(`  ${index + 1}. ${club.name} (${club.category}) - ${club.location}`);
    });
    
    console.log('\n🔍 You can now test US007 search functionality with:');
    console.log('  - Search by name: "Computer Science"');
    console.log('  - Filter by category: "technology", "sports", "arts"');
    console.log('  - Filter by location: "Engineering Building"');
    console.log('  - Sort by: "name", "category", "newest"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedClubs();
}

module.exports = { seedClubs, sampleClubs };
