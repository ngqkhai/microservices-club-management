const { Club } = require('../config/database');
// const mongoose = require('mongoose'); // Available for ObjectId validation if needed
const logger = require('../utils/logger');

class ClubModel {
  static async findAll({ name, type, category, status, location, search, page, limit, sort }) {
    try {
      // Build the query
      const query = {};

      // US007: Advanced search and filtering
      if (search) {
        // Full-text search across multiple fields
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { location: searchRegex }
        ];
      } else {
        // Individual field filters
        if (name) {
          query.name = { $regex: name, $options: 'i' };
        }

        if (location) {
          query.location = { $regex: location, $options: 'i' };
        }
      }

      if (category) {
        query.category = category;
      } else if (type) {
        // Backward compatibility - check both category and type fields
        query.$or = [
          { category: type },
          { type: type }
        ];
      }

      if (status) {
        query.status = status;
      }
      // Note: No default status filter since clubs don't have a status field by default

      // Only show non-deleted clubs (deleted_at is null or doesn't exist)
      // Handle this carefully to avoid conflicts with existing $or conditions
      const deletedFilter = [
        { deleted_at: { $exists: false } },
        { deleted_at: null }
      ];

      if (query.$or) {
        // If there's already an $or condition, wrap everything in $and
        query.$and = [
          { $or: query.$or },
          { $or: deletedFilter }
        ];
        delete query.$or;
      } else {
        query.$or = deletedFilter;
      }

      // Pagination
      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      // Get total count for pagination
      const total = await Club.countDocuments(query);

      // US007: Sorting options
      let sortOption = {};
      switch (sort) {
        case 'name':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        case 'category':
          sortOption = { category: 1, name: 1 };
          break;
        case 'location':
          sortOption = { location: 1, name: 1 };
          break;
        case 'newest':
          sortOption = { created_at: -1 };
          break;
        case 'oldest':
          sortOption = { created_at: 1 };
          break;
        case 'relevance':
        default:
          // For search queries, sort by name (simplified)
          sortOption = { name: 1 };
          break;
      }

      // Execute the query with pagination and sorting
      const results = await Club.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / pageSize);

      return {
        total,
        page: pageNumber,
        totalPages,
        limit: pageSize,
        results: results.map(club => ({
          id: club._id,
          name: club.name,
          description: club.description,
          category: club.category,
          location: club.location,
          logo_url: club.logo_url,
          cover_url: club.cover_url || '',
          status: club.status,
          settings: club.settings,
          member_count: club.member_count || 0,
          created_at: club.created_at,
          manager: club.manager, // Added manager field
          // Backward compatibility
          type: club.type,
          size: club.member_count || 0 // Map member_count to size
        }))
      };
    } catch (error) {
      logger.error('Error in findAll clubs', { error: error.message });
      throw error;
    }
  }

  static async findById(id) {
    try {
      const club = await Club.findById(id);

      if (!club) {return null;}

      return {
        id: club._id,
        name: club.name,
        description: club.description,
        category: club.category,
        location: club.location,
        contact_email: club.contact_email,
        contact_phone: club.contact_phone,
        logo_url: club.logo_url,
        cover_url: club.cover_url || '',
        website_url: club.website_url,
        social_links: club.social_links,
        settings: club.settings,
        status: club.status,
        member_count: club.member_count || 0,
        created_by: club.created_by,
        manager: club.manager, // Added manager field
        // Backward compatibility
        type: club.type,
        size: club.member_count || 0 // Map member_count to size
      };
    } catch (error) {
      logger.error('Error finding club by ID', { error: error.message });
      throw error;
    }
  }

  static async create(clubData) {
    try {
      const {
        name,
        description,
        category,
        location,
        contact_email,
        contact_phone,
        logo_url,
        website_url,
        social_links,
        settings,
        created_by,
        manager, // Added manager field
        // Backward compatibility
        type,
        status
      } = clubData;

      const newClub = new Club({
        name,
        description,
        category: category || type, // Use category or fallback to type for backward compatibility
        location,
        contact_email,
        contact_phone,
        logo_url,
        website_url,
        social_links: social_links || {},
        settings: {
          is_public: settings?.is_public !== undefined ? settings.is_public : true,
          requires_approval: settings?.requires_approval !== undefined ? settings.requires_approval : true,
          max_members: settings?.max_members
        },
        manager, // Added manager field
        member_count: 1, // Start with 1 member (the manager)
        // Backward compatibility fields
        type: type || category,
        status: status || 'ACTIVE',
        created_by
      });

      await newClub.save();

      return {
        id: newClub._id,
        name: newClub.name,
        description: newClub.description,
        category: newClub.category,
        location: newClub.location,
        contact_email: newClub.contact_email,
        contact_phone: newClub.contact_phone,
        logo_url: newClub.logo_url,
        website_url: newClub.website_url,
        social_links: newClub.social_links,
        settings: newClub.settings,
        status: newClub.status,
        member_count: newClub.member_count, // Return the actual member count (1 for new clubs)
        created_by: newClub.created_by,
        manager: newClub.manager, // Added manager field to response
        // Backward compatibility
        type: newClub.type,
        size: newClub.member_count // Map member_count to size for backward compatibility
      };
    } catch (error) {
      // Check for duplicate key error (MongoDB error code 11000)
      if (error.name === 'MongoServerError' && error.code === 11000) {
        logger.error('Duplicate club name error', { error: error.message });
        // Re-throw with original error to preserve the error code
      } else {
        logger.error('Error creating club', { error: error.message });
      }
      throw error;
    }
  }

  /**
   * Find all recruitment campaigns for a specific club
   * @param {string} clubId - The ID of the club
   * @param {Object} options - Query options (status, page, limit)
   * @returns {Promise<Array>} - Array of recruitment campaigns
   */
  static async findRecruitments(clubId, options = {}) {
    try {
      const { RecruitmentCampaign } = require('../config/database');

      // Build query
      const query = { club_id: clubId };
      if (options.status) {
        query.status = options.status;
      }

      // Get total count
      const total = await RecruitmentCampaign.countDocuments(query);

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      // Find recruitment campaigns for this club
      const recruitments = await RecruitmentCampaign.find(query)
        .sort({ start_date: -1 }) // Sort by start date, newest first
        .skip(skip)
        .limit(limit);

      const formattedRecruitments = recruitments.map(recruitment => ({
        id: recruitment._id,
        title: recruitment.title,
        description: recruitment.description,
        requirements: recruitment.requirements,
        application_questions: recruitment.application_questions,
        start_date: recruitment.start_date,
        end_date: recruitment.end_date,
        max_applications: recruitment.max_applications,
        status: recruitment.status,
        statistics: recruitment.statistics,
        // Backward compatibility
        start_at: recruitment.start_at || recruitment.start_date,
        end_at: recruitment.end_at || recruitment.end_date
      }));

      return {
        total,
        recruitments: formattedRecruitments
      };
    } catch (error) {
      logger.error('Error finding recruitments for club', { clubId, error: error.message });
      throw error;
    }
  }

  /**
   * Update club member count
   * @param {string} clubId - The ID of the club
   * @param {number} memberCount - The new member count
   * @returns {Promise<void>}
   */
  static async updateMemberCount(clubId, memberCount) {
    try {
      // Find and update the club, only if member count is valid
      if (memberCount >= 0) {
        await Club.findByIdAndUpdate(clubId, {
          member_count: memberCount,
          size: memberCount // Update size for backward compatibility
        });
      }
    } catch (error) {
      // Intentionally swallow error to prevent crashes for invalid IDs
      logger.warn('Error updating club member count (gracefully handled)', { clubId, error: error.message });
    }
  }

  /**
   * Update club status
   * @param {string} clubId - The club ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} - Updated club
   */
  static async updateStatus(clubId, status) {
    try {
      const updatedClub = await Club.findByIdAndUpdate(
        clubId,
        {
          status: status,
          updated_at: new Date()
        },
        {
          new: true,
          runValidators: true
        }
      );

      return updatedClub;
    } catch (error) {
      logger.error('Error updating club status', { clubId, error: error.message });
      throw error;
    }
  }

  /**
   * Update club size (deprecated, use updateMemberCount instead)
   * @param {string} clubId - The club ID
   * @param {number} size - The new size
   * @returns {Promise<void>}
   */
  static async updateSize(clubId, size) {
    try {
      // Find and update the club, only if size is valid
      if (size >= 0) {
        await Club.findByIdAndUpdate(clubId, {
          size: size,
          member_count: size // Update member_count for consistency
        });
      }
    } catch (error) {
      // Intentionally swallow error to prevent crashes for invalid IDs
      logger.warn('Error updating club size (gracefully handled)', { clubId, error: error.message });
    }
  }

  static async findMembership(clubId, userId) {
    try {
      const { Membership } = require('../config/database');
      const membership = await Membership.findOne({
        club_id: clubId,
        user_id: userId
      }, 'role joined_at');

      if (!membership) {return null;}

      return {
        role: membership.role,
        joined_at: membership.joined_at
      };
    } catch (error) {
      logger.error('Error finding membership', { clubId, userId, error: error.message });
      throw error;
    }
  }

  // US007: Get available categories for filtering
  static async getCategories() {
    try {
      const categories = await Club.distinct('category', {
        $or: [
          { deleted_at: { $exists: false } },
          { deleted_at: null }
        ]
      });
      return categories.sort();
    } catch (error) {
      logger.error('Error getting categories', { error: error.message });
      throw error;
    }
  }

  // US007: Get available locations for filtering
  static async getLocations() {
    try {
      const locations = await Club.distinct('location', {
        $or: [
          { deleted_at: { $exists: false } },
          { deleted_at: null }
        ],
        $and: [
          { location: { $ne: null } },
          { location: { $ne: '' } }
        ]
      });
      return locations.sort();
    } catch (error) {
      logger.error('Error getting locations', { error: error.message });
      throw error;
    }
  }

  // US007: Get club statistics for search context
  static async getStats() {
    try {
      const stats = await Club.aggregate([
        {
          $match: {
            $or: [
              { deleted_at: { $exists: false } },
              { deleted_at: null }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalClubs: { $sum: 1 },
            categories: { $addToSet: '$category' },
            locations: { $addToSet: '$location' },
            averageSize: { $avg: '$size' }
          }
        }
      ]);

      return stats[0] || {
        totalClubs: 0,
        categories: [],
        locations: [],
        averageSize: 0
      };
    } catch (error) {
      logger.error('Error getting club stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = ClubModel;
