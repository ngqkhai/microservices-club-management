const userRepository = require('../repositories/userRepository');
const { validateUpdateUser } = require('../dtos/userDto');
const logger = require('../utils/logger');

class UserService {
  async updateUser(userId, data) {
    const { error } = validateUpdateUser(data);
    if (error) {
      logger.error(`Validation error: ${error.details.map((d) => d.message).join(', ')}`);
      throw new Error(`Dữ liệu không hợp lệ: ${error.details.map((d) => d.message).join(', ')}`);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Check if email is being updated and matches the auth service's email
    if (data.email && data.email !== user.email) {
      throw new Error('Email không thể thay đổi qua API này');
    }

    const updatedUser = await userRepository.updateUser(userId, data);
    logger.info(`User ${userId} updated successfully`);
    return updatedUser;
  }
}

module.exports = new UserService();
