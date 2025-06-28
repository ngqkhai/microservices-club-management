'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when email was verified'
    });

    // Add index for email_verified_at for performance
    await queryInterface.addIndex('users', ['email_verified_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', ['email_verified_at']);
    await queryInterface.removeColumn('users', 'email_verified_at');
  }
};
