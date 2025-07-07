const { Club } = require('../config/database');

class ClubModel {
  static async findAll({ name, type, status, page, limit }) {
    try {
      // Build the query
      const query = {};
      
      // Add filters if provided
      if (name) {
        // Case-insensitive search with regex
        query.name = { $regex: name, $options: 'i' };
      }
      
      if (type) {
        query.type = type;
      }
      
      if (status) {
        query.status = status;
      }
      
      // Pagination
      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;
      
      // Get total count for pagination
      const total = await Club.countDocuments(query);
      
      // Execute the query with pagination
      const results = await Club.find(query, 'id name type status logo_url')
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize);
      
      return {
        total,
        results: results.map(club => ({
          id: club._id,
          name: club.name,
          type: club.type,
          status: club.status,
          logo_url: club.logo_url
        }))
      };
    } catch (error) {
      console.error('Error in findAll clubs:', error);
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const club = await Club.findById(id, 'name description type status logo_url website_url');
      
      if (!club) return null;
      
      return {
        id: club._id,
        name: club.name,
        description: club.description,
        type: club.type,
        status: club.status,
        logo_url: club.logo_url,
        website_url: club.website_url
      };
    } catch (error) {
      console.error('Error finding club by ID:', error);
      throw error;
    }
  }
  
  static async create(clubData) {
    try {
      const { name, description, type, status, logo_url, created_by } = clubData;
      
      const newClub = new Club({
        name,
        description,
        type,
        status: status || 'ACTIVE',
        logo_url,
        created_by
      });
      
      await newClub.save();
      
      return {
        id: newClub._id,
        name: newClub.name,
        description: newClub.description,
        type: newClub.type,
        status: newClub.status,
        logo_url: newClub.logo_url,
        created_by: newClub.created_by
      };
    } catch (error) {
      // Check for duplicate key error (MongoDB error code 11000)
      if (error.name === 'MongoServerError' && error.code === 11000) {
        console.error('Duplicate club name error:', error.message);
        // Re-throw with original error to preserve the error code
      } else {
        console.error('Error creating club:', error);
      }
      throw error;
    }
  }

  /**
   * Find all recruitment rounds for a specific club
   * @param {string} clubId - The ID of the club
   * @returns {Promise<Array>} - Array of recruitment rounds
   */
  static async findRecruitments(clubId) {
    try {
      const { RecruitmentRound } = require('../config/database');
      
      // Find all recruitment rounds for this club
      const recruitments = await RecruitmentRound.find({ 
        club_id: clubId 
      }, 'title start_at status')
      .sort({ start_at: -1 }); // Sort by start date, newest first
      
      return recruitments.map(recruitment => ({
        id: recruitment._id,
        title: recruitment.title,
        start_at: recruitment.start_at,
        status: recruitment.status
      }));
    } catch (error) {
      console.error('Error finding recruitments for club:', error);
      throw error;
    }
  }

  /**
   * Update club size (number of members)
   * @param {string} clubId - The ID of the club
   * @param {number} size - The new size
   * @returns {Promise<void>}
   */
  static async updateSize(clubId, size) {
    try {
      await Club.findByIdAndUpdate(clubId, { size });
    } catch (error) {
      console.error('Error updating club size:', error);
      throw error;
    }
  }

  static async findMembership(clubId, userId) {
    try {
      const { Membership } = require('../config/database');
      const membership = await Membership.findOne({ 
        club_id: clubId, 
        user_id: userId 
      }, 'role joined_at');

      if (!membership) return null;

      return {
        role: membership.role,
        joined_at: membership.joined_at
      };
    } catch (error) {
      console.error('Error finding membership:', error);
      throw error;
    }
  }
}

module.exports = ClubModel;
