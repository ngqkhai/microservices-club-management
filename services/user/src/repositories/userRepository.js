const User = require('../models/user');

class UserRepository {
  async findById(id) {
    return User.findByPk(id);
  }

  async updateUser(id, data) {
    return User.update(
      { ...data, updated_at: new Date() },
      { where: { id }, returning: true }
    ).then(([, [updatedUser]]) => updatedUser);
  }
}

module.exports = new UserRepository();
