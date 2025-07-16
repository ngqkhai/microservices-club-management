'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;
    const now = new Date();

    const users = [
      {
        id: uuidv4(),
        email: 'admin@clubmanagement.com',
        full_name: 'System Administrator',
        password_hash: await bcrypt.hash('AdminPassword123!', saltRounds),
        role: 'admin',
        email_verified: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'user@clubmanagement.com',
        full_name: 'Demo User',
        password_hash: await bcrypt.hash('UserPassword123!', saltRounds),
        role: 'user',
        email_verified: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'john.doe@example.com',
        full_name: 'John Doe',
        password_hash: await bcrypt.hash('JohnPassword123!', saltRounds),
        role: 'user',
        email_verified: false,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'jane.smith@example.com',
        full_name: 'Jane Smith',
        password_hash: await bcrypt.hash('JanePassword123!', saltRounds),
        role: 'user',
        email_verified: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@clubmanagement.com',
          'user@clubmanagement.com',
          'john.doe@example.com',
          'jane.smith@example.com'
        ]
      }
    });
  }
}; 