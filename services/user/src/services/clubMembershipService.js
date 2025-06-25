const axios = require('axios');
const logger = require('../utils/logger');

class ClubMembershipService {
  async getUserClubs(userId, token) {
    try {
      const response = await axios.get(`${process.env.CLUB_SERVICE_URL}/api/clubs/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logger.info(`Retrieved clubs for user ${userId} from club service`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving clubs for user ${userId}: ${error.message}`);
      throw new Error('Không thể lấy danh sách CLB từ club service');
    }
  }
}

module.exports = new ClubMembershipService();
