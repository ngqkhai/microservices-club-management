'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Enhanced Auth Service Seeder
 * Generates realistic Vietnamese user data with proper role distribution
 * 
 * Pre-hashed password: Password123! (bcrypt, 12 rounds)
 */

// Pre-hashed passwords (bcryptjs, 12 rounds)
// All users have password: Password123!
const HASHED_PASSWORDS = {
  default: '$2a$12$XF/BD/SwMS61xqtG2OLhUuKIpd5qBq0Jcw2SDU7GIqZvhU8KPZlCS' // Password123!
};

// Vietnamese name components
const firstNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Vũ', 'Đặng', 'Bùi',
  'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Mai', 'Trinh', 'Lưu', 'Cao', 'Trương'
];

const middleNames = [
  'Văn', 'Thị', 'Thành', 'Minh', 'Hoàng', 'Đức', 'Quốc', 'Anh', 'Hải', 'Hữu',
  'Ngọc', 'Thủy', 'Kim', 'Xuân', 'Duy', 'Bảo', 'Khánh', 'Lan', 'Linh', 'My'
];

const lastNames = [
  'An', 'Bình', 'Cao', 'Đức', 'Em', 'Giang', 'Hoa', 'Khải', 'Linh', 'Mai',
  'Nam', 'Oanh', 'Phúc', 'Quang', 'Sơn', 'Tam', 'Uyên', 'Vy', 'Xuân', 'Yến'
];

const departments = ['CNTT', 'KTPM', 'KHMT', 'ATTT', 'DTPT', 'QTKD', 'TCNH', 'KDQT'];

const interests = [
  'Lập trình', 'Công nghệ', 'Thể thao', 'Âm nhạc', 'Du lịch', 'Đọc sách',
  'Nhiếp ảnh', 'Nấu ăn', 'Game', 'Nghệ thuật', 'Tình nguyện', 'Kinh doanh'
];

// Fixed UUIDs for cross-service reference
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

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function toAsciiSlug(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Core demo users with fixed IDs
    const coreUsers = [
      {
        id: FIXED_USER_IDS.admin1,
        email: 'admin@clubmanagement.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Nguyễn Văn Quản Trị',
        role: 'ADMIN',
        phone: '+84901000001',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
        bio: 'Quản trị viên hệ thống Club Management',
        date_of_birth: new Date('1990-01-15'),
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ linkedin: 'https://linkedin.com/in/admin-system' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.user1,
        email: 'user@clubmanagement.com',
        password_hash: HASHED_PASSWORDS.default,  // Password123!
        full_name: 'Demo User',
        role: 'USER',
        phone: '+84901000002',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        bio: 'A demo user account for testing.',
        date_of_birth: new Date('1998-06-20'),
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ facebook: 'https://facebook.com/demouser' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.manager1,
        email: 'manager@clubmanagement.com',
        password_hash: HASHED_PASSWORDS.default,  // Password123!
        full_name: 'Nguyễn Văn Quản Lý',
        role: 'USER',
        phone: '+84901000003',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager1',
        bio: 'Quản lý câu lạc bộ Công nghệ',
        date_of_birth: new Date('1995-03-10'),
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ linkedin: 'https://linkedin.com/in/manager' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.admin2,
        email: 'clubs.admin@clubmanagement.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Trần Thị Linh',
        role: 'ADMIN',
        phone: '+84901000004',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2',
        bio: 'Quản trị viên phụ trách hoạt động câu lạc bộ',
        date_of_birth: new Date('1991-07-22'),
        gender: 'female',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ linkedin: 'https://linkedin.com/in/clubs-admin' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.manager2,
        email: 'jane.smith@example.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Jane Smith',
        role: 'USER',
        phone: '+84901000005',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager2',
        bio: 'Sports club manager and fitness enthusiast',
        date_of_birth: new Date('1994-11-05'),
        gender: 'female',
        address: 'Hồ Chí Minh, Việt Nam',
        social_links: JSON.stringify({ instagram: 'https://instagram.com/janesmith' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.member1,
        email: 'member1@example.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Trần Thị Thành Viên',
        role: 'USER',
        phone: '+84901000006',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member1',
        bio: 'Sinh viên năm 3, yêu thích công nghệ và thể thao',
        date_of_birth: new Date('2001-04-18'),
        gender: 'female',
        address: 'Đà Nẵng, Việt Nam',
        social_links: JSON.stringify({ facebook: 'https://facebook.com/member1' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.member2,
        email: 'member2@example.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Lê Văn Hoạt Động',
        role: 'USER',
        phone: '+84901000007',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member2',
        bio: 'Tích cực tham gia hoạt động câu lạc bộ',
        date_of_birth: new Date('2000-09-12'),
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ facebook: 'https://facebook.com/member2' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: FIXED_USER_IDS.organizer1,
        email: 'organizer@example.com',
        password_hash: HASHED_PASSWORDS.default,
        full_name: 'Phạm Minh Tổ Chức',
        role: 'USER',
        phone: '+84901000008',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=organizer1',
        bio: 'Event organizer và ban tổ chức',
        date_of_birth: new Date('1999-02-28'),
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        social_links: JSON.stringify({ linkedin: 'https://linkedin.com/in/organizer' }),
        email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      }
    ];

    // Generate additional users
    const additionalUsers = [];
    for (let i = 9; i <= 30; i++) {
      const firstName = randomChoice(firstNames);
      const middleName = randomChoice(middleNames);
      const lastName = randomChoice(lastNames);
      const fullName = `${firstName} ${middleName} ${lastName}`;
      const emailBase = toAsciiSlug(`${lastName}${firstName}${i}`);
      const gender = randomChoice(['male', 'female', 'other']);
      const yearOfStudy = Math.floor(Math.random() * 4) + 1;
      const dept = randomChoice(departments);
      const userInterests = [];
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        const interest = randomChoice(interests);
        if (!userInterests.includes(interest)) userInterests.push(interest);
      }

      additionalUsers.push({
        id: uuidv4(),
        email: `${emailBase}@student.university.edu.vn`,
        password_hash: HASHED_PASSWORDS.default,
        full_name: fullName,
        role: 'USER',
        phone: `+8490${Math.floor(Math.random() * 9000000) + 1000000}`,
        profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        bio: `Sinh viên năm ${yearOfStudy} chuyên ngành ${dept}. Yêu thích ${userInterests.join(', ')}.`,
        date_of_birth: randomDate(new Date('1999-01-01'), new Date('2004-12-31')),
        gender: gender,
        address: randomChoice(['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng']) + ', Việt Nam',
        social_links: JSON.stringify({
          facebook: `https://facebook.com/${emailBase}`,
          instagram: `https://instagram.com/${emailBase}`
        }),
        email_verified: Math.random() > 0.25, // 75% verified
        email_verified_at: Math.random() > 0.25 ? now : null,
        created_at: randomDate(new Date('2024-01-01'), now),
        updated_at: now
      });
    }

    const allUsers = [...coreUsers, ...additionalUsers];

    await queryInterface.bulkInsert('users', allUsers, {});

    console.log(`✅ Seeded ${allUsers.length} users`);
    console.log(`   - ${coreUsers.length} core users (admin, manager, demo)`);
    console.log(`   - ${additionalUsers.length} additional users`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    console.log('✅ All users deleted');
  }
};
