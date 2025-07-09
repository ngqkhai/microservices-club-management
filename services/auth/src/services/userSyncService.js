const axios = require('axios');
const logger = require('../config/logger');

class UserSyncService {
  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
  }

  /**
   * Create user in user service after successful registration/verification
   * @param {Object} userData - User data to sync
   * @returns {Promise<Object>} User creation result
   */
  async syncUserCreation(userData) {
    try {
      const { id, email, full_name, phone, avatar_url } = userData;

      const response = await axios.post(
        `${this.userServiceUrl}/api/users/sync/users`,
        {
          id,
          email,
          full_name,
          phone: phone || null,
          avatar_url: avatar_url || null
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      logger.info(`User ${id} synced successfully with user service`, {
        userId: id,
        email: email
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to sync user ${userData.id} with user service:`, {
        error: error.message,
        userId: userData.id,
        email: userData.email,
        userServiceUrl: this.userServiceUrl
      });

      // Don't throw error - user registration should still succeed 
      // even if sync fails (this is eventual consistency)
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user in user service when auth service user data changes
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Update result
   */
  async syncUserUpdate(userData) {
    try {
      const { id, email, full_name, phone, avatar_url } = userData;

      // This would be a PUT request to update user
      // For now, we'll create if not exists (idempotent)
      return await this.syncUserCreation(userData);
    } catch (error) {
      logger.error(`Failed to sync user update ${userData.id}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new UserSyncService(); 