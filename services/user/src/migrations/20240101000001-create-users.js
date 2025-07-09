'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'User unique identifier (matches auth service user ID)'
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User full name'
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
        unique: true,
        comment: 'User phone number'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'User email address (synced from auth service)'
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL to user avatar image'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record creation timestamp'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record last update timestamp'
      }
    }, {
      comment: 'User profile information table - synced from auth service'
    });

    // Add indexes for performance
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true
    });
    
    await queryInterface.addIndex('users', ['phone'], {
      name: 'idx_users_phone',
      unique: true,
      where: {
        phone: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'idx_users_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
}; 