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
   * Get campaigns for a club (draft campaigns for club managers only)
   * @param {String} clubId - Club ID
   * @param {Object} options - Query options
   * @param {String} userId - User ID (for permission check)
   * @returns {Object} Campaigns with pagination
   */
  static async getCampaigns(clubId, options = {}, userId) {
    try {
      // Check if user has permission to view draft campaigns for this club
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to view draft campaigns for this club');
      }

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
      
      // If campaign is published, paused, or completed, anyone can view it
      if (['published', 'paused', 'completed'].includes(campaign.status)) {
        return campaign;
      }
      
      // If campaign is draft, only club managers can view it
      if (campaign.status === 'draft') {
        if (!userId) {
          throw new Error('Authentication required to view draft campaigns');
        }
        
        const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
        if (!hasPermission) {
          throw new Error('You do not have permission to view this draft campaign');
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
      if (!['draft'].includes(existingCampaign.status)) {
        throw new Error('Only draft campaigns can be updated');
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
      if (existingCampaign.status !== 'draft') {
        throw new Error('Only draft campaigns can be deleted');
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

      // Update status to published
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, {
        status: 'published'
      });

      // Publish event
      await CampaignEventPublisher.publishCampaignPublished(updatedCampaign);

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to publish campaign: ${error.message}`);
    }
  }

  /**
   * Complete campaign (change status from published to completed)
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @returns {Object} Updated campaign
   */
  static async completeCampaign(campaignId, userId) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to complete this campaign');
      }

      // Check if campaign can be completed
      if (!['published', 'paused'].includes(campaign.status)) {
        throw new Error('Only published or paused campaigns can be completed');
      }

      // Update status to completed
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, {
        status: 'completed'
      });

      // Publish event
      await CampaignEventPublisher.publishCampaignStatusChanged(updatedCampaign, 'published');

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to complete campaign: ${error.message}`);
    }
  }

  /**
   * Pause campaign (change status from published to paused)
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @returns {Object} Updated campaign
   */
  static async pauseCampaign(campaignId, userId) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to pause this campaign');
      }

      // Check if campaign can be paused
      if (campaign.status !== 'published') {
        throw new Error('Only published campaigns can be paused');
      }

      // Update status to paused
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, {
        status: 'paused'
      });

      // Publish event
      await CampaignEventPublisher.publishCampaignStatusChanged(updatedCampaign, 'published');

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to pause campaign: ${error.message}`);
    }
  }

  /**
   * Resume campaign (change status from paused to published)
   * @param {String} campaignId - Campaign ID
   * @param {String} userId - User ID
   * @returns {Object} Updated campaign
   */
  static async resumeCampaign(campaignId, userId) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check permission
      const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to resume this campaign');
      }

      // Check if campaign can be resumed
      if (campaign.status !== 'paused') {
        throw new Error('Only paused campaigns can be resumed');
      }

      // Validate that campaign is still within date range
      const now = new Date();
      if (campaign.end_date < now) {
        throw new Error('Cannot resume campaign that has already ended');
      }

      // Update status to published
      const updatedCampaign = await RecruitmentCampaignModel.update(campaignId, {
        status: 'published'
      });

      // Publish event
      await CampaignEventPublisher.publishCampaignStatusChanged(updatedCampaign, 'paused');

      return updatedCampaign;
    } catch (error) {
      throw new Error(`Failed to resume campaign: ${error.message}`);
    }
  }

  /**
   * Get published campaigns (public endpoint)
   * @param {Object} options - Query options
   * @returns {Object} Published campaigns
   */
  static async getPublishedCampaigns(options = {}) {
    try {
      return await RecruitmentCampaignModel.getPublishedCampaigns(options);
    } catch (error) {
      throw new Error(`Failed to get published campaigns: ${error.message}`);
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
        role: { $in: ['admin', 'organizer','club_manager'] }
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
   * Note: With only draft/published statuses, this method is simplified
   */
  static async updateCampaignStatuses() {
    try {
      console.log('✅ Campaign status update completed (draft/published system)');
    } catch (error) {
      console.error('❌ Failed to update campaign statuses:', error.message);
    }
  }
}

module.exports = RecruitmentCampaignService;
