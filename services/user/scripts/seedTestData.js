const { sequelize } = require('../src/config/database');
const User = require('../src/models/user');

async function seed() {
  try {
    await sequelize.sync({ alter: true });
    await User.create({
      id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'Nguyen Van A',
      phone: '0908888888',
      email: 'test@example.com',
      avatar_url: null,
    });
    console.log('Test user seeded');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
