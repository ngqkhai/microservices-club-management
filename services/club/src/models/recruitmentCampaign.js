const { RecruitmentCampaign } = require('../config/database');
const mongoose = require('mongoose');

class RecruitmentCampaignModel {
  
  /**
   * Create a new recruitment campaign
   * @param {Object} campaignData - Campaign data including club_id, title, description, etc.
   * @returns {Object} Created campaign
   */
  static async create(campaignData) {
    try {
      const campaign = new RecruitmentCampaign({
        ...campaignData,
        statistics: {
          total_applications: 0,
          approved_applications: 0,
          rejected_applications: 0,
          pending_applications: 0,
          last_updated: new Date()
        },
        created_at: new Date(),
        updated_at: new Date()
      });

      await campaign.save();
      return campaign;
    } catch (error) {
      throw new Error(`Failed to create recruitment campaign: ${error.message}`);
    }
  }

  /**
   * Find campaigns by club ID
   * @param {String} clubId - Club ID
   * @param {Object} options - Query options (status, page, limit, sort)
   * @returns {Object} Campaigns with pagination info
   */
  static async findByClubId(clubId, options = {}) {
    try {
      const { status, page = 1, limit = 10, sort = 'created_at' } = options;
      
      const query = { club_id: new mongoose.Types.ObjectId(clubId) };
      
      if (status) {
        query.status = status;
      }

      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageSize;

      // Sort options
      let sortOption = {};
      switch (sort) {
        case 'title':
          sortOption = { title: 1 };
          break;
        case 'start_date':
          sortOption = { start_date: 1 };
          break;
        case 'end_date':
          sortOption = { end_date: 1 };
          break;
        case 'created_at':
        default:
          sortOption = { created_at: -1 };
          break;
      }

      const total = await RecruitmentCampaign.countDocuments(query);
      const campaigns = await RecruitmentCampaign.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize)
        .exec();

      return {
        campaigns,
        pagination: {
          current_page: pageNumber,
          total_pages: Math.ceil(total / pageSize),
          total_items: total,
          items_per_page: pageSize
        }
      };
    } catch (error) {
      throw new Error(`Failed to find campaigns: ${error.message}`);
    }
  }

  /**
   * Find campaign by ID
   * @param {String} campaignId - Campaign ID
   * @returns {Object} Campaign
   */
  static async findById(campaignId) {
    try {
      const campaign = await RecruitmentCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      return campaign;
    } catch (error) {
      throw new Error(`Failed to find campaign: ${error.message}`);
    }
  }

  /**
   * Update campaign
   * @param {String} campaignId - Campaign ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated campaign
   */
  static async update(campaignId, updateData) {
    try {
      const campaign = await RecruitmentCampaign.findByIdAndUpdate(
        campaignId,
        {
          ...updateData,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    } catch (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  /**
   * Delete campaign (soft delete would be implemented if needed)
   * @param {String} campaignId - Campaign ID
   * @returns {Boolean} Success status
   */
  static async delete(campaignId) {
    try {
      const result = await RecruitmentCampaign.findByIdAndDelete(campaignId);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  /**
   * Update campaign statistics
   * @param {String} campaignId - Campaign ID
   * @param {Object} stats - Statistics to update
   * @returns {Object} Updated campaign
   */
  static async updateStatistics(campaignId, stats) {
    try {
      const campaign = await RecruitmentCampaign.findByIdAndUpdate(
        campaignId,
        {
          'statistics.total_applications': stats.total_applications,
          'statistics.approved_applications': stats.approved_applications,
          'statistics.rejected_applications': stats.rejected_applications,
          'statistics.pending_applications': stats.pending_applications,
          'statistics.last_updated': new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    } catch (error) {
      throw new Error(`Failed to update campaign statistics: ${error.message}`);
    }
  }

  /**
   * Get published campaigns (for public display)
   * @param {Object} options - Query options
   * @returns {Array} Published campaigns
   */
  static async getPublishedCampaigns(options = {}) {
    try {
      const { club_id, page = 1, limit = 10 } = options;
      
      const query = {
        status: { $in: ['published', 'paused', 'completed'] },
        // The date filter was preventing upcoming published campaigns from being returned.
        // start_date: { $lte: new Date() },
        // end_date: { $gte: new Date() }
      };

      if (club_id) {
        query.club_id = new mongoose.Types.ObjectId(club_id);
      }

      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageSize;

      const total = await RecruitmentCampaign.countDocuments(query);
      const campaigns = await RecruitmentCampaign.find(query)
        .populate('club_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec();

      return {
        campaigns,
        pagination: {
          current_page: pageNumber,
          total_pages: Math.ceil(total / pageSize),
          total_items: total,
          items_per_page: pageSize
        }
      };
    } catch (error) {
      throw new Error(`Failed to get published campaigns: ${error.message}`);
    }
  }

  /**
   * Check if campaign is published and accepting applications
   * @param {String} campaignId - Campaign ID
   * @returns {Boolean} Whether campaign is published and accepting applications
   */
  static async isActive(campaignId) {
    try {
      const campaign = await RecruitmentCampaign.findById(campaignId);
      if (!campaign) {
        return false;
      }

      const now = new Date();
      return campaign.status === 'published' && 
             campaign.start_date <= now && 
             campaign.end_date >= now &&
             (!campaign.max_applications || campaign.statistics.total_applications < campaign.max_applications);
    } catch (error) {
      throw new Error(`Failed to check campaign status: ${error.message}`);
    }
  }

  /**
   * Validate campaign data
   * @param {Object} campaignData - Campaign data to validate
   * @returns {Object} Validation result
   */
  static validateCampaignData(campaignData) {
    const errors = [];

    // Required fields
    if (!campaignData.title || campaignData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!campaignData.description || campaignData.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!campaignData.start_date) {
      errors.push('Start date is required');
    }

    if (!campaignData.end_date) {
      errors.push('End date is required');
    }

    // Date validation
    if (campaignData.start_date && campaignData.end_date) {
      const startDate = new Date(campaignData.start_date);
      const endDate = new Date(campaignData.end_date);
      const now = new Date();

      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }

      if (campaignData.status === 'active' && startDate < now) {
        errors.push('Start date cannot be in the past for active campaigns');
      }
    }

    // Length validation
    if (campaignData.title && campaignData.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (campaignData.description && campaignData.description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }

    if (campaignData.requirements && campaignData.requirements.length > 1000) {
      errors.push('Requirements must be 1000 characters or less');
    }

    // Application questions validation
    if (campaignData.application_questions && Array.isArray(campaignData.application_questions)) {
      campaignData.application_questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
          errors.push(`Question ${index + 1} text is required`);
        }

        if (!question.type || !['text', 'textarea', 'select', 'checkbox'].includes(question.type)) {
          errors.push(`Question ${index + 1} must have a valid type`);
        }

        if (question.type === 'select' || question.type === 'checkbox') {
          if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
            errors.push(`Question ${index + 1} of type ${question.type} must have options`);
          }
        }

        if (question.max_length && question.max_length < 1) {
          errors.push(`Question ${index + 1} max_length must be positive`);
        }
      });
    }

    // Max applications validation
    if (campaignData.max_applications && campaignData.max_applications < 1) {
      errors.push('Max applications must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = RecruitmentCampaignModel;
