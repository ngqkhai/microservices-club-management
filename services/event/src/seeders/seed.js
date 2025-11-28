/**
 * Enhanced Event Service Seeder
 * Based on Python seeder with club-category matched events
 */

import mongoose from 'mongoose';
import { config, logger } from '../config/index.js';
import { Event } from '../models/event.js';
import { Registration } from '../models/registration.js';

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

const FIXED_EVENT_IDS = {
  hackathon: '000000000000000000000101',
  workshop: '000000000000000000000102',
  concert: '000000000000000000000103',
  tournament: '000000000000000000000104',
  charity: '000000000000000000000105',
  startup: '000000000000000000000106',
  englishCamp: '000000000000000000000107',
  aiSeminar: '000000000000000000000108'
};

// Helper function to create dates
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

const now = new Date();

// Comprehensive events data matched to club categories
const eventsData = [
  // Tech Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.hackathon),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech), name: 'CLB Công nghệ Thông tin', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=techclub' },
    title: 'Hackathon AI Challenge 2025',
    description: 'Cuộc thi lập trình 48 giờ với chủ đề Artificial Intelligence và Machine Learning. Đội xuất sắc nhất sẽ nhận giải thưởng 50 triệu đồng!',
    short_description: 'Hackathon AI 48 giờ với giải thưởng lớn',
    category: 'Competition',
    location: { location_type: 'physical', address: 'Hội trường A, ĐHBK Hà Nội', room: 'Tầng 2' },
    start_date: addDays(now, 14),
    end_date: addDays(now, 16),
    registration_deadline: addDays(now, 12),
    max_participants: 100,
    participation_fee: 200000,
    currency: 'VND',
    requirements: ['Kinh nghiệm lập trình Python', 'Hiểu biết cơ bản về AI/ML', 'Làm việc nhóm 2-4 người'],
    tags: ['AI', 'Machine Learning', 'Python', 'Competition', 'Hackathon'],
    images: ['https://picsum.photos/seed/hackathon1/800/600', 'https://picsum.photos/seed/hackathon2/800/600'],
    agenda: [
      { time: '08:00', activity: 'Đăng ký và check-in' },
      { time: '09:00', activity: 'Khai mạc và giới thiệu đề bài' },
      { time: '10:00', activity: 'Bắt đầu coding' },
      { time: '12:00', activity: 'Ăn trưa' },
      { time: '18:00', activity: 'Ăn tối' },
      { time: '09:00 (Ngày 2)', activity: 'Tiếp tục coding' },
      { time: '14:00 (Ngày 2)', activity: 'Nộp bài và thuyết trình' },
      { time: '16:00 (Ngày 2)', activity: 'Lễ trao giải' }
    ],
    status: 'published',
    visibility: 'public',
    organizers: [
      { user_id: FIXED_USER_IDS.manager1, role: 'lead_organizer', user_full_name: 'Nguyễn Văn Quản Lý' },
      { user_id: FIXED_USER_IDS.organizer1, role: 'organizer', user_full_name: 'Phạm Minh Tổ Chức' }
    ],
    statistics: { total_registrations: 45, total_interested: 120, total_attended: 0 },
    created_by: FIXED_USER_IDS.manager1,
    current_participants: 45,
    created_at: addDays(now, -30),
    updated_at: now
  },
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.workshop),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.tech), name: 'CLB Công nghệ Thông tin', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=techclub' },
    title: 'Workshop React & Next.js 2025',
    description: 'Workshop thực hành xây dựng ứng dụng web hiện đại với React, Next.js và TypeScript. Hands-on coding từ cơ bản đến nâng cao.',
    short_description: 'Học React & Next.js qua thực hành',
    category: 'Workshop',
    location: { location_type: 'physical', address: 'Phòng Lab CNTT, Tòa A', room: 'Phòng 301' },
    start_date: addDays(now, 7),
    end_date: addHours(addDays(now, 7), 6),
    registration_deadline: addDays(now, 5),
    max_participants: 30,
    participation_fee: 50000,
    currency: 'VND',
    requirements: ['Kiến thức JavaScript cơ bản', 'Mang laptop cá nhân', 'Đã cài Node.js và VS Code'],
    tags: ['React', 'Next.js', 'TypeScript', 'Frontend', 'Workshop'],
    images: ['https://picsum.photos/seed/workshop1/800/600'],
    agenda: [
      { time: '09:00', activity: 'Đăng ký và check-in' },
      { time: '09:30', activity: 'Giới thiệu React basics' },
      { time: '10:30', activity: 'Thực hành components & hooks' },
      { time: '12:00', activity: 'Nghỉ trưa' },
      { time: '13:30', activity: 'Next.js fundamentals' },
      { time: '15:00', activity: 'Build dự án mini' },
      { time: '16:30', activity: 'Q&A và tổng kết' }
    ],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.organizer1, role: 'lead_organizer', user_full_name: 'Phạm Minh Tổ Chức' }],
    statistics: { total_registrations: 25, total_interested: 80, total_attended: 0 },
    created_by: FIXED_USER_IDS.organizer1,
    current_participants: 25,
    created_at: addDays(now, -14),
    updated_at: now
  },
  // Music Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.concert),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.music),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.music), name: 'CLB Âm nhạc Harmony', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=musicclub' },
    title: 'Đêm nhạc "Những câu chuyện tuổi trẻ"',
    description: 'Đêm nhạc acoustic kết hợp nhiều thể loại từ pop, ballad đến indie. Các thành viên CLB Âm nhạc biểu diễn những ca khúc yêu thích.',
    short_description: 'Đêm nhạc acoustic sinh viên',
    category: 'Other',
    location: { location_type: 'physical', address: 'Hội trường Văn hóa', room: 'Sân khấu chính' },
    start_date: addDays(now, 21),
    end_date: addHours(addDays(now, 21), 4),
    registration_deadline: addDays(now, 19),
    max_participants: 300,
    participation_fee: 50000,
    currency: 'VND',
    requirements: ['Mua vé trước', 'Trang phục lịch sự'],
    tags: ['Music', 'Concert', 'Acoustic', 'Performance'],
    images: ['https://picsum.photos/seed/concert1/800/600', 'https://picsum.photos/seed/concert2/800/600'],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.manager1, role: 'lead_organizer', user_full_name: 'Nguyễn Văn Quản Lý' }],
    statistics: { total_registrations: 180, total_interested: 450, total_attended: 0 },
    created_by: FIXED_USER_IDS.manager1,
    current_participants: 180,
    created_at: addDays(now, -20),
    updated_at: now
  },
  // Sports Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.tournament),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.sports),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.sports), name: 'CLB Thể thao Active', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=sportsclub' },
    title: 'Giải bóng đá sinh viên mở rộng 2025',
    description: 'Giải đấu bóng đá thường niên quy mô lớn với sự tham gia của các trường đại học trong khu vực. Giải thưởng hấp dẫn cho đội vô địch!',
    short_description: 'Giải bóng đá sinh viên liên trường',
    category: 'Competition',
    location: { location_type: 'physical', address: 'Sân vận động trường', room: 'Sân A và B' },
    start_date: addDays(now, 30),
    end_date: addDays(now, 32),
    registration_deadline: addDays(now, 25),
    max_participants: 200,
    participation_fee: 500000,
    currency: 'VND',
    requirements: ['Đăng ký theo đội (11-15 người)', 'Sinh viên đang theo học', 'Có giấy khám sức khỏe'],
    tags: ['Football', 'Sports', 'Tournament', 'Competition'],
    images: ['https://picsum.photos/seed/football1/800/600'],
    agenda: [
      { time: '07:00', activity: 'Đăng ký các đội' },
      { time: '08:00', activity: 'Khai mạc giải' },
      { time: '09:00', activity: 'Vòng bảng - Ngày 1' },
      { time: '08:00 (Ngày 2)', activity: 'Tứ kết và bán kết' },
      { time: '14:00 (Ngày 2)', activity: 'Chung kết và lễ trao giải' }
    ],
    status: 'published',
    visibility: 'public',
    organizers: [
      { user_id: FIXED_USER_IDS.manager2, role: 'lead_organizer', user_full_name: 'Jane Smith' },
      { user_id: FIXED_USER_IDS.member2, role: 'organizer', user_full_name: 'Lê Văn Hoạt Động' }
    ],
    statistics: { total_registrations: 160, total_interested: 500, total_attended: 0 },
    created_by: FIXED_USER_IDS.manager2,
    current_participants: 160,
    created_at: addDays(now, -45),
    updated_at: now
  },
  // Volunteer Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.charity),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.volunteer),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.volunteer), name: 'CLB Tình nguyện Xanh', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=volunteerclub' },
    title: 'Chiến dịch Xanh - Trồng cây gây rừng',
    description: 'Hoạt động tình nguyện trồng 1000 cây xanh tại khu vực ngoại thành. Góp phần bảo vệ môi trường và chống biến đổi khí hậu.',
    short_description: 'Trồng cây bảo vệ môi trường',
    category: 'Social',
    location: { location_type: 'physical', address: 'Khu vực đồi Sóc Sơn', room: 'Điểm tập trung: Cổng trường' },
    start_date: addDays(now, 10),
    end_date: addHours(addDays(now, 10), 8),
    registration_deadline: addDays(now, 8),
    max_participants: 150,
    participation_fee: 0,
    currency: 'VND',
    requirements: ['Mang găng tay và giày thể thao', 'Sẵn sàng làm việc ngoài trời', 'Tinh thần tình nguyện'],
    tags: ['Volunteer', 'Environment', 'Green', 'Community', 'TreePlanting'],
    images: ['https://picsum.photos/seed/volunteer1/800/600', 'https://picsum.photos/seed/volunteer2/800/600'],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.member1, role: 'lead_organizer', user_full_name: 'Trần Thị Thành Viên' }],
    statistics: { total_registrations: 120, total_interested: 200, total_attended: 0 },
    created_by: FIXED_USER_IDS.member1,
    current_participants: 120,
    created_at: addDays(now, -15),
    updated_at: now
  },
  // Business Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.startup),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.business),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.business), name: 'CLB Khởi nghiệp Startup', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=startupclub' },
    title: 'Startup Pitch Night 2025',
    description: 'Cuộc thi thuyết trình ý tưởng khởi nghiệp. Cơ hội gặp gỡ nhà đầu tư và mentors từ các startup thành công.',
    short_description: 'Thuyết trình ý tưởng startup',
    category: 'Competition',
    location: { location_type: 'hybrid', address: 'Innovation Hub, Tòa D', room: 'Hội trường' },
    start_date: addDays(now, 28),
    end_date: addHours(addDays(now, 28), 5),
    registration_deadline: addDays(now, 21),
    max_participants: 60,
    participation_fee: 100000,
    currency: 'VND',
    requirements: ['Có ý tưởng kinh doanh', 'Đội nhóm 2-5 người', 'Chuẩn bị slide thuyết trình 5 phút'],
    tags: ['Startup', 'Pitch', 'Business', 'Entrepreneurship', 'Investment'],
    images: ['https://picsum.photos/seed/startup1/800/600'],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.organizer1, role: 'lead_organizer', user_full_name: 'Phạm Minh Tổ Chức' }],
    statistics: { total_registrations: 40, total_interested: 150, total_attended: 0 },
    created_by: FIXED_USER_IDS.organizer1,
    current_participants: 40,
    created_at: addDays(now, -10),
    updated_at: now
  },
  // English Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.englishCamp),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.english),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.english), name: 'CLB Tiếng Anh English Zone', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=englishclub' },
    title: 'English Summer Camp 2025',
    description: 'Trại hè tiếng Anh với các hoạt động giao tiếp, game shows, và giao lưu với sinh viên quốc tế. Nâng cao kỹ năng Speaking!',
    short_description: 'Trại hè tiếng Anh giao lưu quốc tế',
    category: 'Workshop',
    location: { location_type: 'physical', address: 'Khu nghỉ dưỡng Flamingo Đại Lải' },
    start_date: addDays(now, 45),
    end_date: addDays(now, 47),
    registration_deadline: addDays(now, 35),
    max_participants: 80,
    participation_fee: 1500000,
    currency: 'VND',
    requirements: ['Trình độ tiếng Anh cơ bản', 'Sẵn sàng giao tiếp', 'Đăng ký và đóng phí trước'],
    tags: ['English', 'Camp', 'Speaking', 'International', 'Learning'],
    images: ['https://picsum.photos/seed/englishcamp1/800/600', 'https://picsum.photos/seed/englishcamp2/800/600'],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.member2, role: 'lead_organizer', user_full_name: 'Lê Văn Hoạt Động' }],
    statistics: { total_registrations: 65, total_interested: 200, total_attended: 0 },
    created_by: FIXED_USER_IDS.member2,
    current_participants: 65,
    created_at: addDays(now, -25),
    updated_at: now
  },
  // AI Club Events
  {
    _id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.aiSeminar),
    club_id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.ai),
    club: { id: new mongoose.Types.ObjectId(FIXED_CLUB_IDS.ai), name: 'CLB Trí tuệ Nhân tạo', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=aiclub' },
    title: 'Seminar: Tương lai của Generative AI',
    description: 'Các chuyên gia chia sẻ về xu hướng Generative AI, từ ChatGPT đến Stable Diffusion. Thảo luận về ứng dụng và thách thức.',
    short_description: 'Khám phá Generative AI với chuyên gia',
    category: 'Seminar',
    location: { location_type: 'hybrid', address: 'Phòng AI Lab, Tòa B', room: 'Phòng 205', virtual_link: 'https://meet.google.com/abc-defg-hij' },
    start_date: addDays(now, 5),
    end_date: addHours(addDays(now, 5), 3),
    registration_deadline: addDays(now, 3),
    max_participants: 200,
    participation_fee: 0,
    currency: 'VND',
    requirements: ['Quan tâm đến AI', 'Không yêu cầu kiến thức chuyên sâu'],
    tags: ['AI', 'GenerativeAI', 'ChatGPT', 'Seminar', 'Technology'],
    images: ['https://picsum.photos/seed/aiseminar1/800/600'],
    status: 'published',
    visibility: 'public',
    organizers: [{ user_id: FIXED_USER_IDS.organizer1, role: 'lead_organizer', user_full_name: 'Phạm Minh Tổ Chức' }],
    statistics: { total_registrations: 150, total_interested: 350, total_attended: 0 },
    created_by: FIXED_USER_IDS.organizer1,
    current_participants: 150,
    created_at: addDays(now, -7),
    updated_at: now
  }
];

// Sample registrations
const registrationsData = [
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.hackathon),
    user_id: FIXED_USER_IDS.member1,
    user_email: 'member1@example.com',
    user_name: 'Trần Thị Thành Viên',
    status: 'registered',
    registered_at: addDays(now, -5),
    registration_data: { answers: [{ question_id: 'team_size', question_text: 'Team size', answer_value: '3', answer_type: 'number' }], special_requirements: 'Vegetarian food please' },
    emergency_contact: { name: 'Trần Văn Phụ Huynh', phone: '+84909876543', relationship: 'Parent' }
  },
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.hackathon),
    user_id: FIXED_USER_IDS.member2,
    user_email: 'member2@example.com',
    user_name: 'Lê Văn Hoạt Động',
    status: 'registered',
    registered_at: addDays(now, -3),
    registration_data: { answers: [{ question_id: 'team_size', question_text: 'Team size', answer_value: '2', answer_type: 'number' }] }
  },
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.workshop),
    user_id: FIXED_USER_IDS.user1,
    user_email: 'user@clubmanagement.com',
    user_name: 'Demo User',
    status: 'registered',
    registered_at: addDays(now, -2)
  },
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.concert),
    user_id: FIXED_USER_IDS.member1,
    user_email: 'member1@example.com',
    user_name: 'Trần Thị Thành Viên',
    status: 'registered',
    registered_at: addDays(now, -10)
  },
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.charity),
    user_id: FIXED_USER_IDS.user1,
    user_email: 'user@clubmanagement.com',
    user_name: 'Demo User',
    status: 'registered',
    registered_at: addDays(now, -4)
  },
  {
    event_id: new mongoose.Types.ObjectId(FIXED_EVENT_IDS.charity),
    user_id: FIXED_USER_IDS.member2,
    user_email: 'member2@example.com',
    user_name: 'Lê Văn Hoạt Động',
    status: 'registered',
    registered_at: addDays(now, -3)
  }
];

async function seed() {
  try {
    logger.info('Starting event service database seeding...');

    await mongoose.connect(config.get('MONGODB_URI'));
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await Registration.deleteMany({});
    logger.info('Cleared existing data');

    // Seed events
    await Event.insertMany(eventsData);
    logger.info(`Seeded ${eventsData.length} events`);

    // Seed registrations
    const formattedRegistrations = registrationsData.map(r => ({
      ...r,
      ticket_id: `ticket-${Math.random().toString(36).substr(2, 9)}`,
      created_at: r.registered_at,
      updated_at: now
    }));
    await Registration.insertMany(formattedRegistrations);
    logger.info(`Seeded ${formattedRegistrations.length} registrations`);

    logger.info('✅ Event service database seeding completed successfully!');
    logger.info('\nSeeded data summary:');
    logger.info(`- ${eventsData.length} events (Hackathon, Workshop, Concert, Tournament, Charity, etc.)`);
    logger.info(`- ${formattedRegistrations.length} registrations across events`);

    // Show events by category
    const categories = [...new Set(eventsData.map(e => e.category))];
    logger.info('\nEvents by category:');
    categories.forEach(cat => {
      const count = eventsData.filter(e => e.category === cat).length;
      logger.info(`  - ${cat}: ${count} events`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
