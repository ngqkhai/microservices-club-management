'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'John Doe',
        phone: '0908888888',
        email: 'john.doe@example.com',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Jane Smith',
        phone: '0909999999',
        email: 'jane.smith@example.com',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        full_name: 'Admin User',
        phone: null,
        email: 'admin@example.com',
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        full_name: 'Test Student',
        phone: '0907777777',
        email: 'student@university.edu',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
}; 