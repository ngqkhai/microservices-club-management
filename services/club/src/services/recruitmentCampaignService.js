const RecruitmentCampaignModel = require('../models/recruitmentCampaign');
const { Club } = require('../config/database');
const CampaignEventPublisher = require('../utils/campaignEventPublisher');

class RecruitmentCampaignService {
  
  /**
   * Create a new recruitment campaign
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (creator)
   * @param {Object} campaignData - Campaign data
   * @returns {Object} Created campaign
   */
  static async createCampaign(clubId, userId, campaignData) {
    try {
      // Validate campaign data
      const validation = RecruitmentCampaignModel.validateCampaignData(campaignData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if club exists
      const club = await Club.findById(clubId);
      if (!club) {
        throw new Error('Club not found');
      }

      // Check if user has permission to create campaigns for this club
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to create campaigns for this club');
      }

      // Generate unique question IDs if not provided
      if (campaignData.application_questions && Array.isArray(campaignData.application_questions)) {
        campaignData.application_questions = campaignData.application_questions.map((question, index) => ({
          ...question,
          id: question.id || `q${index + 1}_${Date.now()}`
        }));
      }

      // Create campaign
      const campaign = await RecruitmentCampaignModel.create({
        club_id: clubId,
        ...campaignData,
        created_by: userId
      });

      // If campaign is published immediately, publish event
      if (campaign.status === 'active') {
        await CampaignEventPublisher.publishCampaignPublished(campaign);
      } else {
        await CampaignEventPublisher.publishCampaignCreated(campaign);
      }

      return campaign;
    } catch (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  /**
   * Get campaigns for a club
   * @param {String} clubId - Club ID
   * @param {Object} options - Query options
   * @returns {Object} Campaigns with pagination
   */
  static async getCampaigns(clubId, options = {}) {
    try {
      const campaigns = await RecruitmentCampaignModel.findByClubId(clubId, options);
      return campaigns;
    } catch (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaign by ID
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID (for permission check)
   * @returns {Object} Campaign
   */
  static async getCampaign(campaignId, userId = null) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      
      // If user is provided, check if they have permission to view this campaign
      if (userId) {
        const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
        if (!hasPermission && campaign.status !== 'active') {
          throw new Error('You do not have permission to view this campaign');
        }
      }

      return campaign;
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  /**
   * Update campaign
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated campaign
   */
  static async updateCampaign(campaignId, userId, updateData) {
    try {
      // Get existing campaign
      const existingCampaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!existingCampaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(existingCampaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to update this campaign');
      }

      // Check if campaign can be updated
      if (existingCampaign.status === 'completed' || existingCampaign.status === 'cancelled') {
        throw new Error('Cannot update completed or cancelled campaigns');
      }

      // If there are applications, restrict certain updates
      if (existingCampaign.statistics.total_applications > 0) {
        const restrictedFields = ['application_questions', 'max_applications'];
        const hasRestrictedChanges = restrictedFields.some(field => updateData.hasOwnProperty(field));
        if (hasRestrictedChanges) {
          throw new Error('Cannot modify application questions or max applications after applications have been submitted');
        }
      }

      // Validate update data
      const validation = RecruitmentCampaignModel.validateCampaignData({
        ...existingCampaign.toObject(),
        ...updateData
      });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Update campaign
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, updateData);

      // Publish event if status changed
      if (updateData.status && updateData.status !== existingCampaign.status) {
        await CampaignEventPublisher.publishCampaignStatusChanged(updatedCampaign, existingCampaign.status);
      } else {
        await CampaignEventPublisher.publishCampaignUpdated(updatedCampaign, updateData);
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  /**
   * Delete campaign
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  static async deleteCampaign(campaignId, userId) {
    try {
      // Get existing campaign
      const existingCampaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!existingCampaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(existingCampaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to delete this campaign');
      }

      // Check if campaign can be deleted
      if (existingCampaign.statistics.total_applications > 0) {
        throw new Error('Cannot delete campaigns with existing applications');
      }

      // Delete campaign
      const deleted = await RecruitmentCampaignModel.delete(campaignId);

      if (deleted) {
        await CampaignEventPublisher.publishCampaignDeleted(existingCampaign);
      }

      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  /**
   * Publish campaign (change status from draft to active)
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @returns {Object} Updated campaign
   */
  static async publishCampaign(campaignId, userId) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to publish this campaign');
      }

      // Check if campaign can be published
      if (campaign.status !== 'draft') {
        throw new Error('Only draft campaigns can be published');
      }

      // Validate dates
      const now = new Date();
      if (campaign.start_date < now) {
        throw new Error('Cannot publish campaign with start date in the past');
      }

      // Update status to active
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, {
        status: 'active'
      });

      // Publish event
      await CampaignEventPublisher.publishCampaignPublished(updatedCampaign);

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to publish campaign: ${error.message}`);
    }
  }

  /**
   * Get active campaigns (public endpoint)
   * @param {Object} options - Query options
   * @returns {Object} Active campaigns
   */
  static async getActiveCampaigns(options = {}) {
    try {
      return await RecruitmentCampaignModel.getActiveCampaigns(options);
    } catch (error) {
      throw new Error(`Failed to get active campaigns: ${error.message}`);
    }
  }

  /**
   * Check if user has permission to manage campaigns for a club
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID
   * @returns {Boolean} Has permission
   */
  static async checkCampaignPermission(clubId, userId) {
    try {
      // This would typically check club memberships or call auth service
      // For now, we'll implement a basic check
      const { Membership } = require('../config/database');
      
      const membership = await Membership.findOne({
        club_id: clubId,
        user_id: userId,
        status: 'active',
        role: { $in: ['admin', 'organizer'] }
      });

      return !!membership;
    } catch (error) {
      // In case of error, deny permission
      console.error('Permission check failed:', error.message);
      return false;
    }
  }

  /**
   * Auto-update campaign statuses based on dates
   * This would typically be called by a cron job
   */
  static async updateCampaignStatuses() {
    try {
      const now = new Date();
      const { RecruitmentCampaign } = require('../config/database');
      
      // Update campaigns that should be completed
      const result = await RecruitmentCampaign.updateMany(
        {
          status: 'active',
          end_date: { $lt: now }
        },
        {
          status: 'completed',
          updated_at: now
        }
      );

      console.log(`✅ ${result.modifiedCount} campaign statuses updated automatically`);
    } catch (error) {
      console.error('❌ Failed to update campaign statuses:', error.message);
    }
  }
}

module.exports = RecruitmentCampaignService;
