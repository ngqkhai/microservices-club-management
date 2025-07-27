const RecruitmentCampaignModel = require('../models/recruitmentCampaign');
const { Club, RecruitmentCampaign } = require('../config/database');
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
      if (campaign.status === 'published') {
        await CampaignEventPublisher.publishCampaignPublished(campaign);
      } else {
        await CampaignEventPublisher.publishCampaignCreated(campaign);
      }

      return campaign.toManagerJSON();
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
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // If campaign is published, anyone can view it
      if (campaign.status === 'published') {
        return userId ? campaign.toManagerJSON() : campaign.toPublicJSON();
      }
      
      // If campaign is draft, paused, or completed, only club managers can view it
      if (['draft', 'paused', 'completed'].includes(campaign.status)) {
        if (!userId) {
          throw new Error('Authentication required to view this campaign');
        }
        
        const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
        if (!hasPermission) {
          throw new Error('You do not have permission to view this campaign');
        }
        
        return campaign.toManagerJSON();
      }

      // Unknown status - default to manager access only
      if (!userId) {
        throw new Error('Authentication required to view this campaign');
      }
      
      const hasPermission = await this.checkCampaignPermission(campaign.club_id, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to view this campaign');
      }
      
      return campaign.toManagerJSON();
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

      return updatedCampaign.toManagerJSON();
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
   * Publish campaign (change status from draft to published)
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

      return updatedCampaign.toManagerJSON();
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

      return updatedCampaign.toManagerJSON();
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

      return updatedCampaign.toManagerJSON();
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

      return updatedCampaign.toManagerJSON();
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
      const result = await RecruitmentCampaignModel.getPublishedCampaigns(options);
      
      // Transform campaigns using toPublicJSON method which includes club name
      const transformedCampaigns = result.campaigns.map(campaign => campaign.toPublicJSON());
      
      return {
        campaigns: transformedCampaigns,
        pagination: result.pagination
      };
    } catch (error) {
      throw new Error(`Failed to get published campaigns: ${error.message}`);
    }
  }

  /**
   * Get published campaign by ID (public endpoint)
   * @param {String} campaignId - Campaign ID
   * @returns {Object} Campaign details
   */
  static async getPublishedCampaignById(campaignId) {
    try {
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Only return published campaigns for public access
      if (campaign.status !== 'published') {
        throw new Error('Campaign is not published or not available');
      }

      return campaign.toPublicJSON();
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error.message}`);
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

  // ========================= APPLICATION MANAGEMENT =========================

  /**
   * Submit an application to a recruitment campaign
   * @param {String} campaignId - Campaign ID
   * @param {Object} applicationData - Application data including user info and answers
   * @returns {Object} Created application
   */
  static async submitApplication(campaignId, applicationData) {
    try {
      const { user_id, user_email, user_full_name, answers, ...otherData } = applicationData;

      // Validate required fields
      console.log('📋 Submitting application data:', applicationData);
      if (!user_id || !user_email || !user_full_name || !answers) {
        throw new Error('User ID, email, full name, and answers are required');
      }

      // Find the campaign
      const campaign = await RecruitmentCampaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check if campaign is accepting applications
      if (campaign.status !== 'published') {
        throw new Error('Campaign is not currently accepting applications');
      }

      // Check if campaign deadline has passed
      const now = new Date();
      if (campaign.end_date && new Date(campaign.end_date) < now) {
        throw new Error('Campaign application deadline has passed');
      }

      const { Membership } = require('../config/database');
      
      // Check if user already has a membership (active or pending) for this club
      const existingMembership = await Membership.findOne({
        club_id: campaign.club_id,
        user_id: user_id,
        status: { $in: ['active', 'pending'] }
      });

      if (existingMembership) {
        if (existingMembership.status === 'active') {
          throw new Error('You are already an active member of this club');
        } else {
          throw new Error('You already have a pending application for this club');
        }
      }

      // Check if campaign has reached max applications
      if (campaign.max_applications) {
        const currentApplications = await Membership.countDocuments({
          campaign_id: campaignId,
          status: { $in: ['pending', 'active'] }
        });
        if (currentApplications >= campaign.max_applications) {
          throw new Error('Campaign has reached maximum number of applications');
        }
      }

      // Validate answers against campaign questions
      const validationResult = this.validateApplicationAnswers(answers, campaign.application_questions);
      if (!validationResult.isValid) {
        throw new Error(`Invalid answers: ${validationResult.errors.join(', ')}`);
      }

      // Create membership application directly
      const membership = await Membership.create({
        club_id: campaign.club_id,
        user_id: user_id,
        user_email: user_email,
        user_full_name: user_full_name,
        campaign_id: campaignId,
        role: 'member',
        status: 'pending',
        application_message: `Application submitted through recruitment campaign: ${campaign.title}`,
        application_answers: {
          answers: answers,
          submitted_at: new Date(),
          ...otherData
        },
        joined_at: new Date()
      });

      // Update campaign statistics
      await this.updateCampaignStatistics(campaignId);

      return {
        success: true,
        message: 'Application submitted successfully',
        membership: {
          id: membership._id,
          status: membership.status,
          role: membership.role,
          club_id: membership.club_id,
          campaign_id: membership.campaign_id,
          submitted_at: membership.joined_at
        }
      };
    } catch (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }
  }

  /**
   * Get application details for the applicant
   * @param {String} applicationId - Application ID
   * @param {String} userId - User ID (must match application user)
   * @returns {Object} Application details
   */
  static async getApplication(applicationId, userId) {
    try {
      const { Membership } = require('../config/database');
      
      const membership = await Membership.findById(applicationId);
      if (!membership) {
        throw new Error('Application not found');
      }

      // Check if user owns this application
      if (membership.user_id !== userId) {
        throw new Error('You do not have permission to view this application');
      }

      return {
        id: membership._id,
        user_id: membership.user_id,
        club_id: membership.club_id,
        campaign_id: membership.campaign_id,
        status: membership.status,
        role: membership.role,
        application_message: membership.application_message,
        application_answers: membership.application_answers,
        submitted_at: membership.joined_at,
        approved_at: membership.approved_at,
        rejection_reason: membership.removal_reason
      };
    } catch (error) {
      throw new Error(`Failed to get application: ${error.message}`);
    }
  }

  /**
   * Update an application (only if allowed by campaign settings)
   * @param {String} applicationId - Application ID
   * @param {String} userId - User ID
   * @param {Object} updateData - Updated application data
   * @returns {Object} Updated application
   */
  static async updateApplication(applicationId, userId, updateData) {
    try {
      const { Membership } = require('../config/database');
      
      const membership = await Membership.findById(applicationId);
      if (!membership) {
        throw new Error('Application not found');
      }

      // Check if user owns this application
      if (membership.user_id !== userId) {
        throw new Error('You do not have permission to update this application');
      }

      // Check if application can be updated
      if (membership.status !== 'pending') {
        throw new Error('Application cannot be updated after it has been reviewed');
      }

      // Get campaign to check if editing is allowed
      const campaign = await RecruitmentCampaignModel.findById(membership.campaign_id);
      if (!campaign) {
        throw new Error('Associated campaign not found');
      }

      // Check if campaign is still accepting applications
      if (campaign.status !== 'published') {
        throw new Error('Campaign is no longer accepting applications');
      }

      // Check deadline
      const now = new Date();
      if (campaign.end_date && new Date(campaign.end_date) < now) {
        throw new Error('Application deadline has passed');
      }

      // Validate answers if provided
      if (updateData.answers) {
        const validationResult = this.validateApplicationAnswers(updateData.answers, campaign.application_questions);
        if (!validationResult.isValid) {
          throw new Error(`Invalid answers: ${validationResult.errors.join(', ')}`);
        }
      }

      // Prepare update data for membership
      const membershipUpdate = {};
      if (updateData.answers) {
        membershipUpdate.application_answers = {
          ...membership.application_answers,
          answers: updateData.answers,
          updated_at: new Date()
        };
      }
      if (updateData.message) {
        membershipUpdate.application_message = updateData.message;
      }

      // Update membership
      const updatedMembership = await Membership.findByIdAndUpdate(
        applicationId,
        membershipUpdate,
        { new: true }
      );

      return {
        id: updatedMembership._id,
        user_id: updatedMembership.user_id,
        club_id: updatedMembership.club_id,
        campaign_id: updatedMembership.campaign_id,
        status: updatedMembership.status,
        application_message: updatedMembership.application_message,
        application_answers: updatedMembership.application_answers,
        submitted_at: updatedMembership.joined_at
      };
    } catch (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  /**
   * Withdraw an application
   * @param {String} applicationId - Application ID
   * @param {String} userId - User ID
   */
  static async withdrawApplication(applicationId, userId) {
    try {
      const { Membership } = require('../config/database');
      
      const membership = await Membership.findById(applicationId);
      if (!membership) {
        throw new Error('Application not found');
      }

      // Check if user owns this application
      if (membership.user_id !== userId) {
        throw new Error('You do not have permission to withdraw this application');
      }

      // Check if application can be withdrawn
      if (membership.status === 'active') {
        throw new Error('Cannot withdraw an approved application');
      }

      if (membership.status === 'removed') {
        throw new Error('Application has already been withdrawn');
      }

      // Update membership status to removed (withdrawn)
      await Membership.findByIdAndUpdate(applicationId, {
        status: 'removed',
        removal_reason: 'Withdrawn by user',
        removed_at: new Date()
      });

      // Update campaign statistics
      await this.updateCampaignStatistics(membership.campaign_id);

      return {
        success: true,
        message: 'Application withdrawn successfully'
      };
    } catch (error) {
      throw new Error(`Failed to withdraw application: ${error.message}`);
    }
  }

  /**
   * Get all applications for a campaign (Club Managers only)
   * @param {String} campaignId - Campaign ID
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (manager)
   * @param {Object} options - Query options
   * @returns {Object} Applications with pagination
   */
  static async getCampaignApplications(campaignId, clubId, userId, options = {}) {
    try {
      // Check if user has permission to view applications
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to view applications for this campaign');
      }

      // Verify campaign exists and belongs to club
      const campaign = await RecruitmentCampaign.findOne({
        _id: campaignId,
        club_id: clubId
      });

      if (!campaign) {
        throw new Error('Campaign not found or does not belong to this club');
      }

      const { page = 1, limit = 10, status } = options;
      const { Membership } = require('../config/database');

      // Build query for memberships
      let query = {
        campaign_id: campaignId,
        club_id: clubId
      };

      if (status) {
        query.status = status;
      }

      // Get applications (memberships) with pagination
      const skip = (page - 1) * limit;
      const memberships = await Membership.find(query)
        .sort({ joined_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Membership.countDocuments(query);

      return {
        applications: memberships.map(membership => ({
          id: membership._id,
          user_id: membership.user_id,
          user_email: membership.user_email,
          user_full_name: membership.user_full_name,
          club_id: membership.club_id,
          campaign_id: membership.campaign_id,
          status: membership.status,
          role: membership.role,
          application_message: membership.application_message,
          application_answers: membership.application_answers,
          submitted_at: membership.joined_at,
          approved_by: membership.approved_by,
          approved_at: membership.approved_at,
          rejection_reason: membership.removal_reason
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to get campaign applications: ${error.message}`);
    }
  }

  /**
   * Get specific application details (Club Managers only)
   * @param {String} applicationId - Application ID
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (manager)
   * @returns {Object} Application details
   */
  static async getApplicationDetails(applicationId, clubId, userId) {
    try {
      // Check if user has permission
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to view this application');
      }

      const { Membership } = require('../config/database');
      
      const membership = await Membership.findOne({
        _id: applicationId,
        club_id: clubId
      });

      if (!membership) {
        throw new Error('Application not found or does not belong to this club');
      }

      return {
        id: membership._id,
        user_id: membership.user_id,
        user_email: membership.user_email,
        user_full_name: membership.user_full_name,
        club_id: membership.club_id,
        campaign_id: membership.campaign_id,
        status: membership.status,
        role: membership.role,
        application_message: membership.application_message,
        application_answers: membership.application_answers,
        submitted_at: membership.joined_at,
        approved_by: membership.approved_by,
        approved_at: membership.approved_at,
        rejection_reason: membership.removal_reason
      };
    } catch (error) {
      throw new Error(`Failed to get application details: ${error.message}`);
    }
  }

  /**
   * Update application status
   * @param {String} applicationId - Application ID
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (manager)
   * @param {String} status - New status
   * @param {String} notes - Review notes
   * @returns {Object} Updated application
   */
  static async updateApplicationStatus(applicationId, clubId, userId, status, notes) {
    try {
      // Check if user has permission
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to update this application');
      }

      // Map application statuses to membership statuses
      const statusMapping = {
        'pending': 'pending',
        'under_review': 'pending',
        'approved': 'active',
        'rejected': 'rejected'
      };

      if (!statusMapping[status]) {
        throw new Error('Invalid status');
      }

      const { Membership } = require('../config/database');
      
      const membership = await Membership.findOne({
        _id: applicationId,
        club_id: clubId
      });

      if (!membership) {
        throw new Error('Application not found or does not belong to this club');
      }

      // Update membership
      const updateData = {
        status: statusMapping[status]
      };

      if (status === 'approved') {
        updateData.approved_by = userId;
        updateData.approved_at = new Date();
      }

      if (notes) {
        updateData.application_message = membership.application_message + ` | Manager notes: ${notes}`;
      }

      const updatedMembership = await Membership.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true }
      );

      return {
        id: updatedMembership._id,
        user_id: updatedMembership.user_id,
        club_id: updatedMembership.club_id,
        campaign_id: updatedMembership.campaign_id,
        status: updatedMembership.status,
        role: updatedMembership.role,
        application_message: updatedMembership.application_message,
        approved_by: updatedMembership.approved_by,
        approved_at: updatedMembership.approved_at
      };
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Approve an application and add user to club
   * @param {String} applicationId - Application ID
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (manager)
   * @param {String} role - Role to assign (member, organizer)
   * @param {String} notes - Approval notes
   * @returns {Object} Result with application and membership info
   */
  static async approveApplication(applicationId, clubId, userId, role = 'member', notes) {
    try {
      // Check if user has permission
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to approve this application');
      }

      const { Membership } = require('../config/database');
      
      // Find the pending membership
      const membership = await Membership.findOne({
        _id: applicationId,
        club_id: clubId,
        status: 'pending'
      });

      if (!membership) {
        throw new Error('Pending application not found or does not belong to this club');
      }

      // Check for any existing active membership for this user
      const existingActiveMembership = await Membership.findOne({
        user_id: membership.user_id,
        club_id: clubId,
        status: 'active'
      });

      if (existingActiveMembership) {
        throw new Error('User is already an active member of this club');
      }

      // Update the pending membership to active
      const updatedMembership = await Membership.findByIdAndUpdate(
        applicationId,
        {
          role: role,
          status: 'active',
          application_message: membership.application_message + (notes ? ` | Manager notes: ${notes}` : ''),
          approved_by: userId,
          approved_at: new Date()
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Application approved successfully',
        membership: {
          id: updatedMembership._id,
          user_id: updatedMembership.user_id,
          club_id: updatedMembership.club_id,
          role: updatedMembership.role,
          status: updatedMembership.status,
          approved_by: updatedMembership.approved_by,
          approved_at: updatedMembership.approved_at
        }
      };
    } catch (error) {
      throw new Error(`Failed to approve application: ${error.message}`);
    }
  }

  /**
   * Reject an application
   * @param {String} applicationId - Application ID
   * @param {String} clubId - Club ID
   * @param {String} userId - User ID (manager)
   * @param {String} reason - Rejection reason
   * @param {String} notes - Additional notes
   * @returns {Object} Updated application
   */
  static async rejectApplication(applicationId, clubId, userId, reason, notes) {
    try {
      // Check if user has permission
      const hasPermission = await this.checkCampaignPermission(clubId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to reject this application');
      }

      const { Membership } = require('../config/database');
      
      // Find the pending membership
      const membership = await Membership.findOne({
        _id: applicationId,
        club_id: clubId,
        status: 'pending'
      });

      if (!membership) {
        throw new Error('Pending application not found or does not belong to this club');
      }

      // Update the pending membership to rejected
      const updatedMembership = await Membership.findByIdAndUpdate(
        applicationId,
        {
          status: 'rejected',
          removal_reason: reason,
          application_message: membership.application_message + (notes ? ` | Manager notes: ${notes}` : ''),
          approved_by: userId,
          approved_at: new Date()
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Application rejected successfully',
        membership: {
          id: updatedMembership._id,
          user_id: updatedMembership.user_id,
          club_id: updatedMembership.club_id,
          status: updatedMembership.status,
          rejection_reason: updatedMembership.removal_reason,
          rejected_by: updatedMembership.approved_by,
          rejected_at: updatedMembership.approved_at
        }
      };
    } catch (error) {
      throw new Error(`Failed to reject application: ${error.message}`);
    }
  }

  // ========================= HELPER METHODS =========================

  /**
   * Validate application answers against campaign questions
   * @param {Array} answers - User answers
   * @param {Array} questions - Campaign questions
   * @returns {Object} Validation result
   */
  static validateApplicationAnswers(answers, questions) {
    const errors = [];

    if (!Array.isArray(answers)) {
      return { isValid: false, errors: ['Answers must be an array'] };
    }

    if (!Array.isArray(questions)) {
      return { isValid: false, errors: ['Campaign questions not found'] };
    }

    // Check required questions are answered
    const requiredQuestions = questions.filter(q => q.required);
    const answeredQuestionIds = answers.map(a => a.question_id);

    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question.id)) {
        errors.push(`Answer required for question: ${question.question}`);
      }
    }

    // Validate answer formats
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      if (!question) {
        errors.push(`Invalid question ID: ${answer.question_id}`);
        continue;
      }

      // Validate based on question type
      switch (question.type) {
        case 'text':
        case 'textarea':
          if (typeof answer.answer !== 'string') {
            errors.push(`Answer for "${question.question}" must be text`);
          } else if (question.max_length && answer.answer.length > question.max_length) {
            errors.push(`Answer for "${question.question}" exceeds maximum length`);
          }
          break;
        case 'select':
          if (!question.options || !question.options.includes(answer.answer)) {
            errors.push(`Invalid option selected for "${question.question}"`);
          }
          break;
        case 'checkbox':
          if (!Array.isArray(answer.answer)) {
            errors.push(`Answer for "${question.question}" must be an array`);
          } else if (question.options) {
            const invalidOptions = answer.answer.filter(opt => !question.options.includes(opt));
            if (invalidOptions.length > 0) {
              errors.push(`Invalid options selected for "${question.question}": ${invalidOptions.join(', ')}`);
            }
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Update campaign statistics
   * @param {String} campaignId - Campaign ID
   */
  static async updateCampaignStatistics(campaignId) {
    try {
      const { Membership } = require('../config/database');
      
      const stats = {
        total_applications: await Membership.countDocuments({ campaign_id: campaignId }),
        pending_applications: await Membership.countDocuments({ campaign_id: campaignId, status: 'pending' }),
        approved_applications: await Membership.countDocuments({ campaign_id: campaignId, status: 'active' }),
        rejected_applications: await Membership.countDocuments({ campaign_id: campaignId, status: 'rejected' })
      };

      await RecruitmentCampaignModel.updateStatistics(campaignId, stats);
    } catch (error) {
      console.error('Failed to update campaign statistics:', error.message);
    }
  }

  /**
   * Get all applications for a specific user across all campaigns
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} User applications with pagination
   */
  static async getUserApplications(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const { Membership } = require('../config/database');

      // Build query for user's memberships (applications)
      let query = {
        user_id: userId,
        campaign_id: { $exists: true, $ne: null } // Only memberships created through campaigns
      };

      if (status) {
        query.status = status;
      }

      // Get user applications with pagination
      const skip = (page - 1) * limit;
      const memberships = await Membership.find(query)
        .populate('campaign_id', 'title description club_id start_date end_date status')
        .populate('club_id', 'name description logo')
        .sort({ joined_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Membership.countDocuments(query);

      // Format response
      const applications = memberships.map(membership => ({
        id: membership._id,
        status: membership.status,
        role: membership.role,
        application_message: membership.application_message,
        application_answers: membership.application_answers,
        submitted_at: membership.joined_at,
        approved_by: membership.approved_by,
        approved_at: membership.approved_at,
        rejection_reason: membership.removal_reason,
        campaign: membership.campaign_id ? {
          id: membership.campaign_id._id,
          title: membership.campaign_id.title,
          description: membership.campaign_id.description,
          start_date: membership.campaign_id.start_date,
          end_date: membership.campaign_id.end_date,
          status: membership.campaign_id.status
        } : null,
        club: membership.club_id ? {
          id: membership.club_id._id,
          name: membership.club_id.name,
          description: membership.club_id.description,
          logo: membership.club_id.logo
        } : null
      }));

      return {
        applications,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user applications: ${error.message}`);
    }
  }
}

module.exports = RecruitmentCampaignService;
