'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
      comment: 'User gender preference'
    });

    // Add index for gender for potential filtering/reporting
    await queryInterface.addIndex('users', ['gender']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', ['gender']);
    await queryInterface.removeColumn('users', 'gender');

    // Remove the ENUM type if it was created
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_gender";');
  }
};
