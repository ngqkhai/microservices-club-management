/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('users', 'profile_picture_url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'date_of_birth', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'social_links', {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: true
    });

    // Add unique constraint for phone separately to handle existing data
    await queryInterface.addConstraint('users', {
      fields: ['phone'],
      type: 'unique',
      name: 'users_phone_unique',
      where: {
        phone: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove constraint first
    await queryInterface.removeConstraint('users', 'users_phone_unique');
    
    // Remove columns
    await queryInterface.removeColumn('users', 'social_links');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'date_of_birth');
    await queryInterface.removeColumn('users', 'bio');
    await queryInterface.removeColumn('users', 'profile_picture_url');
    await queryInterface.removeColumn('users', 'phone');
  }
}; 