/**
 * Enhanced Club Service Seeder
 * Based on Python seeder with Vietnamese content and proper relationships
 */

const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../config/logger');

// Fixed IDs for cross-service reference
const FIXED_USER_IDS = {
  admin1: '00000000-0000-0000-0000-000000000001',
  user1: '00000000-0000-0000-0000-000000000002',
  manager1: '00000000-0000-0000-0000-000000000003',
  admin2: '00000000-0000-0000-0000-000000000004',
  manager2: '00000000-0000-0000-0000-000000000005',
  member1: '00000000-0000-0000-0000-000000000006',
  member2: '00000000-0000-0000-0000-000000000007',
  organizer1: '00000000-0000-0000-0000-000000000008'
};

// Fixed Club IDs
const FIXED_CLUB_IDS = {
  tech: '000000000000000000000001',
  music: '000000000000000000000002',
  sports: '000000000000000000000003',
  art: '000000000000000000000004',
  volunteer: '000000000000000000000005',
  business: '000000000000000000000006',
  ai: '000000000000000000000007',
  english: '000000000000000000000008'
};

// Fixed Campaign IDs
const FIXED_CAMPAIGN_IDS = {
  techRecruitment: '000000000000000000000011',
  sportsRecruitment: '000000000000000000000012',
  volunteerRecruitment: '000000000000000000000013'
};

// Comprehensive club data by category
const clubsData = [
  // Technology Clubs
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech),
    name: 'CLB Công nghệ Thông tin',
    description: 'Câu lạc bộ dành cho sinh viên yêu thích lập trình, AI, và các công nghệ mới. Tổ chức workshop, hackathon và các dự án công nghệ thực tế.',
    category: 'Công nghệ',
    location: 'Phòng Lab CNTT, Tòa A, Phòng 301',
    contact_email: 'tech.club@university.edu.vn',
    contact_phone: '+84901234567',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=techclub',
    cover_url: 'https://picsum.photos/seed/techclub/1200/400',
    website_url: 'https://techclub.university.edu.vn',
    social_links: {
      facebook: 'https://facebook.com/techclub.university',
      instagram: 'https://instagram.com/techclub_uni',
      github: 'https://github.com/techclub-university'
    },
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.manager1,
      full_name: 'Nguyễn Văn Quản Lý',
      email: 'manager@clubmanagement.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: true, max_members: 200 },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-01-15'),
    updated_at: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.ai),
    name: 'CLB Trí tuệ Nhân tạo',
    description: 'Nghiên cứu và phát triển các ứng dụng AI, Machine Learning, Deep Learning. Tham gia các cuộc thi quốc tế về AI.',
    category: 'Công nghệ',
    location: 'Phòng AI Lab, Tòa B, Phòng 205',
    contact_email: 'ai.club@university.edu.vn',
    contact_phone: '+84901234568',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=aiclub',
    cover_url: 'https://picsum.photos/seed/aiclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.organizer1,
      full_name: 'Phạm Minh Tổ Chức',
      email: 'organizer@example.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: true, max_members: 100 },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-02-20'),
    updated_at: new Date()
  },
  // Music/Culture Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.music),
    name: 'CLB Âm nhạc Harmony',
    description: 'Câu lạc bộ âm nhạc đa dạng thể loại, từ nhạc cổ điển, pop đến rock và acoustic. Weekly jam sessions và monthly concerts.',
    category: 'Nghệ thuật',
    location: 'Phòng Âm nhạc, Tòa Văn hóa',
    contact_email: 'music.club@university.edu.vn',
    contact_phone: '+84901234569',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=musicclub',
    cover_url: 'https://picsum.photos/seed/musicclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.manager1,
      full_name: 'Nguyễn Văn Quản Lý',
      email: 'manager@clubmanagement.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: false, max_members: 80 },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-01-10'),
    updated_at: new Date()
  },
  // Sports Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.sports),
    name: 'CLB Thể thao Active',
    description: 'Câu lạc bộ thể thao đa năng với các môn: bóng đá, bóng rổ, cầu lông, bơi lội. Tổ chức giải đấu và hoạt động thể thao hàng tuần.',
    category: 'Thể thao',
    location: 'Nhà thi đấu đa năng',
    contact_email: 'sports.club@university.edu.vn',
    contact_phone: '+84901234570',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=sportsclub',
    cover_url: 'https://picsum.photos/seed/sportsclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.manager2,
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: false },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-01-05'),
    updated_at: new Date()
  },
  // Art Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.art),
    name: 'CLB Nghệ thuật Sáng tạo',
    description: 'Khám phá và phát triển khả năng nghệ thuật: hội họa, điêu khắc, nhiếp ảnh và digital art. Triển lãm định kỳ hàng quý.',
    category: 'Nghệ thuật',
    location: 'Phòng Nghệ thuật, Tòa C',
    contact_email: 'art.club@university.edu.vn',
    contact_phone: '+84901234571',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=artclub',
    cover_url: 'https://picsum.photos/seed/artclub/1200/400',
    status: 'INACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.user1,
      full_name: 'Demo User',
      email: 'user@clubmanagement.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: true },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-03-01'),
    updated_at: new Date()
  },
  // Volunteer Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.volunteer),
    name: 'CLB Tình nguyện Xanh',
    description: 'Hoạt động tình nguyện bảo vệ môi trường, hỗ trợ cộng đồng, và các chương trình từ thiện. Trồng cây, dọn rác, dạy học miễn phí.',
    category: 'Cộng đồng',
    location: 'Phòng Đoàn Thanh niên',
    contact_email: 'volunteer@university.edu.vn',
    contact_phone: '+84901234572',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=volunteerclub',
    cover_url: 'https://picsum.photos/seed/volunteerclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.member1,
      full_name: 'Trần Thị Thành Viên',
      email: 'member1@example.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: false },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-02-01'),
    updated_at: new Date()
  },
  // Business Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.business),
    name: 'CLB Khởi nghiệp Startup',
    description: 'Hỗ trợ sinh viên khởi nghiệp, tìm hiểu về startup, pitch idea, marketing và networking. Tổ chức các buổi gặp gỡ doanh nhân.',
    category: 'Kinh doanh',
    location: 'Innovation Hub, Tòa D',
    contact_email: 'startup@university.edu.vn',
    contact_phone: '+84901234573',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=startupclub',
    cover_url: 'https://picsum.photos/seed/startupclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.organizer1,
      full_name: 'Phạm Minh Tổ Chức',
      email: 'organizer@example.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: true, max_members: 150 },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-01-25'),
    updated_at: new Date()
  },
  // Academic Club
  {
    _id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.english),
    name: 'CLB Tiếng Anh English Zone',
    description: 'Luyện tập tiếng Anh giao tiếp, IELTS, TOEFL. Giao lưu với sinh viên quốc tế và tổ chức English Camp.',
    category: 'Học thuật',
    location: 'Phòng Ngoại ngữ, Tòa E',
    contact_email: 'english@university.edu.vn',
    contact_phone: '+84901234574',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=englishclub',
    cover_url: 'https://picsum.photos/seed/englishclub/1200/400',
    status: 'ACTIVE',
    manager: {
      user_id: FIXED_USER_IDS.member2,
      full_name: 'Lê Văn Hoạt Động',
      email: 'member2@example.com',
      assigned_at: new Date()
    },
    settings: { is_public: true, requires_approval: false },
    created_by: FIXED_USER_IDS.admin1,
    created_at: new Date('2024-02-10'),
    updated_at: new Date()
  }
];

// Memberships data
const membershipsData = [
  // Tech Club members
  { club_id: FIXED_CLUB_IDS.tech, user_id: FIXED_USER_IDS.manager1, role: 'club_manager', status: 'active', user_email: 'manager@clubmanagement.com', user_full_name: 'Nguyễn Văn Quản Lý' },
  { club_id: FIXED_CLUB_IDS.tech, user_id: FIXED_USER_IDS.organizer1, role: 'organizer', status: 'active', user_email: 'organizer@example.com', user_full_name: 'Phạm Minh Tổ Chức' },
  { club_id: FIXED_CLUB_IDS.tech, user_id: FIXED_USER_IDS.member1, role: 'member', status: 'active', user_email: 'member1@example.com', user_full_name: 'Trần Thị Thành Viên' },
  { club_id: FIXED_CLUB_IDS.tech, user_id: FIXED_USER_IDS.member2, role: 'member', status: 'active', user_email: 'member2@example.com', user_full_name: 'Lê Văn Hoạt Động' },
  { club_id: FIXED_CLUB_IDS.tech, user_id: FIXED_USER_IDS.user1, role: 'member', status: 'pending', user_email: 'user@clubmanagement.com', user_full_name: 'Demo User' },
  
  // Music Club members
  { club_id: FIXED_CLUB_IDS.music, user_id: FIXED_USER_IDS.manager1, role: 'club_manager', status: 'active', user_email: 'manager@clubmanagement.com', user_full_name: 'Nguyễn Văn Quản Lý' },
  { club_id: FIXED_CLUB_IDS.music, user_id: FIXED_USER_IDS.user1, role: 'member', status: 'active', user_email: 'user@clubmanagement.com', user_full_name: 'Demo User' },
  { club_id: FIXED_CLUB_IDS.music, user_id: FIXED_USER_IDS.member1, role: 'member', status: 'active', user_email: 'member1@example.com', user_full_name: 'Trần Thị Thành Viên' },
  
  // Sports Club members
  { club_id: FIXED_CLUB_IDS.sports, user_id: FIXED_USER_IDS.manager2, role: 'club_manager', status: 'active', user_email: 'jane.smith@example.com', user_full_name: 'Jane Smith' },
  { club_id: FIXED_CLUB_IDS.sports, user_id: FIXED_USER_IDS.member2, role: 'organizer', status: 'active', user_email: 'member2@example.com', user_full_name: 'Lê Văn Hoạt Động' },
  { club_id: FIXED_CLUB_IDS.sports, user_id: FIXED_USER_IDS.user1, role: 'member', status: 'active', user_email: 'user@clubmanagement.com', user_full_name: 'Demo User' },
  
  // Volunteer Club members
  { club_id: FIXED_CLUB_IDS.volunteer, user_id: FIXED_USER_IDS.member1, role: 'club_manager', status: 'active', user_email: 'member1@example.com', user_full_name: 'Trần Thị Thành Viên' },
  { club_id: FIXED_CLUB_IDS.volunteer, user_id: FIXED_USER_IDS.member2, role: 'member', status: 'active', user_email: 'member2@example.com', user_full_name: 'Lê Văn Hoạt Động' },
  { club_id: FIXED_CLUB_IDS.volunteer, user_id: FIXED_USER_IDS.organizer1, role: 'member', status: 'active', user_email: 'organizer@example.com', user_full_name: 'Phạm Minh Tổ Chức' },
  
  // Business Club members
  { club_id: FIXED_CLUB_IDS.business, user_id: FIXED_USER_IDS.organizer1, role: 'club_manager', status: 'active', user_email: 'organizer@example.com', user_full_name: 'Phạm Minh Tổ Chức' },
  { club_id: FIXED_CLUB_IDS.business, user_id: FIXED_USER_IDS.manager1, role: 'member', status: 'active', user_email: 'manager@clubmanagement.com', user_full_name: 'Nguyễn Văn Quản Lý' }
];

// Recruitment Campaigns
const campaignsData = [
  {
    _id: new mongoose.Types.ObjectId(FIXED_CAMPAIGN_IDS.techRecruitment),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech),
    title: 'Tuyển thành viên CLB Công nghệ 2025',
    description: 'Bạn đam mê lập trình và công nghệ? Hãy gia nhập CLB Công nghệ để cùng nhau học hỏi, chia sẻ và phát triển!',
    requirements: ['Sinh viên đang theo học tại trường', 'Đam mê công nghệ và lập trình', 'Sẵn sàng học hỏi và cống hiến'],
    application_questions: [
      { id: 'q1', question: 'Tại sao bạn muốn tham gia CLB Công nghệ?', type: 'textarea', required: true, max_length: 500 },
      { id: 'q2', question: 'Bạn có kinh nghiệm lập trình ngôn ngữ/công nghệ nào?', type: 'text', required: true },
      { id: 'q3', question: 'Lĩnh vực công nghệ bạn quan tâm nhất?', type: 'select', required: true, options: ['Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Cybersecurity', 'Other'] }
    ],
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    max_applications: 50,
    status: 'published',
    created_by: FIXED_USER_IDS.manager1,
    statistics: { total_applications: 1, approved_applications: 0, rejected_applications: 0, pending_applications: 1, last_updated: new Date() },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(FIXED_CAMPAIGN_IDS.sportsRecruitment),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.sports),
    title: 'Tuyển vận động viên CLB Thể thao',
    description: 'CLB Thể thao Active tuyển thành viên mới cho các đội bóng đá, bóng rổ và cầu lông. Tham gia để rèn luyện sức khỏe!',
    requirements: ['Yêu thích thể thao', 'Có tinh thần đồng đội', 'Sẵn sàng tập luyện hàng tuần'],
    application_questions: [
      { id: 'q1', question: 'Môn thể thao bạn yêu thích và có kinh nghiệm?', type: 'text', required: true },
      { id: 'q2', question: 'Bạn có thể tham gia tập luyện mấy buổi/tuần?', type: 'select', required: true, options: ['1 buổi', '2 buổi', '3 buổi', 'Nhiều hơn 3 buổi'] },
      { id: 'q3', question: 'Lý do bạn muốn tham gia CLB?', type: 'textarea', required: true, max_length: 400 }
    ],
    start_date: new Date(),
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    max_applications: 100,
    status: 'published',
    created_by: FIXED_USER_IDS.manager2,
    statistics: { total_applications: 0, approved_applications: 0, rejected_applications: 0, pending_applications: 0, last_updated: new Date() },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(FIXED_CAMPAIGN_IDS.volunteerRecruitment),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.volunteer),
    title: 'Tuyển tình nguyện viên mùa hè 2025',
    description: 'Cùng CLB Tình nguyện Xanh tham gia các hoạt động bảo vệ môi trường và hỗ trợ cộng đồng trong mùa hè này!',
    requirements: ['Có tinh thần tình nguyện', 'Sẵn sàng tham gia hoạt động ngoài trời', 'Có trách nhiệm với công việc'],
    application_questions: [
      { id: 'q1', question: 'Bạn đã từng tham gia hoạt động tình nguyện nào chưa?', type: 'textarea', required: false, max_length: 300 },
      { id: 'q2', question: 'Thời gian bạn có thể tham gia hoạt động?', type: 'checkbox', required: true, options: ['Ngày thường', 'Cuối tuần', 'Buổi tối', 'Toàn thời gian mùa hè'] },
      { id: 'q3', question: 'Điều bạn mong muốn đóng góp cho cộng đồng?', type: 'textarea', required: true, max_length: 500 }
    ],
    start_date: new Date(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    max_applications: 200,
    status: 'draft',
    created_by: FIXED_USER_IDS.member1,
    statistics: { total_applications: 0, approved_applications: 0, rejected_applications: 0, pending_applications: 0, last_updated: new Date() },
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seed() {
  try {
    logger.info('Starting club service database seeding...');

    await mongoose.connect(config.get('MONGODB_URI'));
    logger.info('Connected to MongoDB');

    const { Club, Membership, RecruitmentCampaign } = require('../config/database');

    // Clear existing data
    await Club.deleteMany({});
    await Membership.deleteMany({});
    await RecruitmentCampaign.deleteMany({});
    logger.info('Cleared existing data');

    // Seed clubs
    await Club.insertMany(clubsData);
    logger.info(`Seeded ${clubsData.length} clubs`);

    // Seed memberships
    const formattedMemberships = membershipsData.map(m => ({
      ...m,
      club_id: new mongoose.Types.ObjectId(m.club_id),
      joined_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date()
    }));
    await Membership.insertMany(formattedMemberships);
    logger.info(`Seeded ${formattedMemberships.length} memberships`);

    // Seed campaigns
    await RecruitmentCampaign.insertMany(campaignsData);
    logger.info(`Seeded ${campaignsData.length} recruitment campaigns`);

    logger.info('✅ Club service database seeding completed successfully!');
    logger.info('\nSeeded data summary:');
    logger.info(`- ${clubsData.length} clubs (Tech, Music, Sports, Art, Volunteer, Business, AI, English)`);
    logger.info(`- ${formattedMemberships.length} memberships across clubs`);
    logger.info(`- ${campaignsData.length} recruitment campaigns`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
