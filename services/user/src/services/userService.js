const userRepository = require('../repositories/userRepository');
const { validateUpdateUser, validateCreateUser } = require('../dtos/userDto');
const logger = require('../utils/logger');

class UserService {
  async createUser(userData) {
    // Validate input data
    const { error } = validateCreateUser(userData);
    if (error) {
      logger.error(`User creation validation error: ${error.details.map((d) => d.message).join(', ')}`);
      throw new Error(`Invalid user data: ${error.details.map((d) => d.message).join(', ')}`);
    }

    const { id, email, full_name, phone, avatar_url } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findById(id);
    if (existingUser) {
      logger.warn(`User ${id} already exists, skipping creation`);
      return existingUser;
    }

    const newUser = await userRepository.createUser({
      id,
      email,
      full_name,
      phone: phone || null,
      avatar_url: avatar_url || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    logger.info(`User ${id} created successfully via sync`);
    return newUser;
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    logger.info(`User profile retrieved for user ${userId}`);
    
    // Return user data without sensitive information
    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

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
