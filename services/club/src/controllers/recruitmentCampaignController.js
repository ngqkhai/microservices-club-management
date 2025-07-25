const RecruitmentCampaignService = require('../services/recruitmentCampaignService');
const { 
  CreateCampaignDTO, 
  UpdateCampaignDTO, 
  CampaignResponseDTO, 
  CampaignListResponseDTO 
} = require('../dtos/recruitmentCampaignDTOs');

class RecruitmentCampaignController {
  
  /**
   * Create a new recruitment campaign
   * POST /api/clubs/:clubId/campaigns
   */
  static async createCampaign(req, res) {
    try {
      const { clubId } = req.params;
      const userId = req.user?.id; // Assuming user ID is available from auth middleware

      // Validate required fields
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Create and validate DTO
      const campaignDTO = new CreateCampaignDTO(req.body);
      const validation = campaignDTO.validate();

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const campaign = await RecruitmentCampaignService.createCampaign(clubId, userId, campaignDTO);

      res.status(201).json({
        success: true,
        message: `Campaign ${campaign.status === 'active' ? 'created and published' : 'created as draft'} successfully`,
        data: new CampaignResponseDTO(campaign)
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get campaigns for a club (only draft campaigns for club managers)
   * GET /api/clubs/:clubId/campaigns
   */
  static async getCampaigns(req, res) {
    try {
      const { clubId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Only return draft campaigns for club managers
      const options = {
        status: 'draft',
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      };

      const result = await RecruitmentCampaignService.getCampaigns(clubId, options, userId);

      res.status(200).json({
        success: true,
        message: 'Draft campaigns retrieved successfully',
        data: new CampaignListResponseDTO(result.campaigns, result.pagination)
      });
    } catch (error) {
      const statusCode = error.message.includes('permission') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get campaign by ID
   * GET /api/clubs/:clubId/campaigns/:campaignId
   */
  static async getCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id; // Optional for public access

      const campaign = await RecruitmentCampaignService.getCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign retrieved successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Update campaign
   * PUT /api/clubs/:clubId/campaigns/:campaignId
   */
  static async updateCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Create and validate DTO
      const updateDTO = new UpdateCampaignDTO(req.body);
      const validation = updateDTO.validate();

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const campaign = await RecruitmentCampaignService.updateCampaign(campaignId, userId, updateDTO);

      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: new CampaignResponseDTO(campaign)
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Delete campaign
   * DELETE /api/clubs/:clubId/campaigns/:campaignId
   */
  static async deleteCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const deleted = await RecruitmentCampaignService.deleteCampaign(campaignId, userId);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Campaign deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Publish campaign (change status from draft to active)
   * POST /api/clubs/:clubId/campaigns/:campaignId/publish
   */
  static async publishCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const campaign = await RecruitmentCampaignService.publishCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign published successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get published campaigns (public endpoint)
   * GET /api/campaigns/published
   * GET /api/clubs/:clubId/campaigns/published
   */
  static async getPublishedCampaigns(req, res) {
    try {
      const options = {
        club_id: req.params.clubId || req.query.club_id,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await RecruitmentCampaignService.getPublishedCampaigns(options);

      res.status(200).json({
        success: true,
        message: 'Published campaigns retrieved successfully',
        data: result.campaigns,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get campaign details by ID (public endpoint for published campaigns)
   * GET /api/campaigns/:campaignId
   */
  static async getCampaignById(req, res) {
    try {
      const { campaignId } = req.params;

      // Get campaign details from service (only returns published campaigns for public access)
      const campaign = await RecruitmentCampaignService.getPublishedCampaignById(campaignId);

      res.status(200).json({
        success: true,
        message: 'Campaign details retrieved successfully',
        data: campaign
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not published')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message,
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
  }

  /**
   * Publish campaign (change status from draft to published)
   * POST /api/clubs/:clubId/campaigns/:campaignId/publish
   */
  static async publishCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const campaign = await RecruitmentCampaignService.publishCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign published successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Complete campaign (change status from published to completed)
   * POST /api/clubs/:clubId/campaigns/:campaignId/complete
   */
  static async completeCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const campaign = await RecruitmentCampaignService.completeCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign completed successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Pause campaign (change status from published to paused)
   * POST /api/clubs/:clubId/campaigns/:campaignId/pause
   */
  static async pauseCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const campaign = await RecruitmentCampaignService.pauseCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign paused successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Resume campaign (change status from paused to published)
   * POST /api/clubs/:clubId/campaigns/:campaignId/resume
   */
  static async resumeCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const campaign = await RecruitmentCampaignService.resumeCampaign(campaignId, userId);

      res.status(200).json({
        success: true,
        message: 'Campaign resumed successfully',
        data: campaign
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // ========================= APPLICATION MANAGEMENT =========================

  /**
   * Submit an application to a recruitment campaign
   * POST /api/campaigns/:campaignId/apply
   */
  static async submitApplication(req, res) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      const userEmail = req.user?.email || req.headers['x-user-email'];
      const userFullName = req.user?.full_name || req.headers['x-user-full-name'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const applicationData = {
        ...req.body,
        user_id: userId,
        user_email: userEmail,
        user_full_name: userFullName
      };

      const application = await RecruitmentCampaignService.submitApplication(campaignId, applicationData);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('already applied') ? 409 :
                        error.message.includes('closed') ? 400 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get application status and details
   * GET /api/campaigns/:campaignId/applications/:applicationId
   */
  static async getApplication(req, res) {
    try {
      const { campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];

      const application = await RecruitmentCampaignService.getApplication(applicationId, userId);

      res.status(200).json({
        success: true,
        message: 'Application retrieved successfully',
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update an application
   * PUT /api/campaigns/:campaignId/applications/:applicationId
   */
  static async updateApplication(req, res) {
    try {
      const { campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];

      const application = await RecruitmentCampaignService.updateApplication(applicationId, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 :
                        error.message.includes('not allowed') ? 400 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Withdraw an application
   * DELETE /api/campaigns/:campaignId/applications/:applicationId
   */
  static async withdrawApplication(req, res) {
    try {
      const { campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];

      await RecruitmentCampaignService.withdrawApplication(applicationId, userId);

      res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all applications for a campaign (Club Managers only)
   * GET /api/clubs/:clubId/campaigns/:campaignId/applications
   */
  static async getCampaignApplications(req, res) {
    try {
      const { clubId, campaignId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      const { page = 1, limit = 10, status } = req.query;

      const applications = await RecruitmentCampaignService.getCampaignApplications(
        campaignId, 
        clubId, 
        userId, 
        { page: parseInt(page), limit: parseInt(limit), status }
      );

      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: applications
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get specific application details (Club Managers only)
   * GET /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId
   */
  static async getApplicationDetails(req, res) {
    try {
      const { clubId, campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];

      const application = await RecruitmentCampaignService.getApplicationDetails(applicationId, clubId, userId);

      res.status(200).json({
        success: true,
        message: 'Application details retrieved successfully',
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update application status
   * PUT /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/status
   */
  static async updateApplicationStatus(req, res) {
    try {
      const { clubId, campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      const { status, notes } = req.body;

      const application = await RecruitmentCampaignService.updateApplicationStatus(
        applicationId, 
        clubId, 
        userId, 
        status, 
        notes
      );

      res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Approve an application and add user to club
   * POST /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/approve
   */
  static async approveApplication(req, res) {
    try {
      const { clubId, campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      const { role = 'member', notes } = req.body;

      const result = await RecruitmentCampaignService.approveApplication(
        applicationId, 
        clubId, 
        userId, 
        role, 
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Application approved and user added to club successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reject an application
   * POST /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/reject
   */
  static async rejectApplication(req, res) {
    try {
      const { clubId, campaignId, applicationId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      const { reason, notes } = req.body;

      const application = await RecruitmentCampaignService.rejectApplication(
        applicationId, 
        clubId, 
        userId, 
        reason, 
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Application rejected successfully',
        data: application
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all applications for a specific user
   * GET /api/users/:userId/applications
   */
  static async getUserApplications(req, res) {
    try {
      const { userId } = req.params;
      const authUserId = req.user?.id;

      // Check if user is requesting their own applications or has admin privileges
      if (userId !== authUserId) {
        // You might want to add admin check here if needed
        return res.status(403).json({
          success: false,
          message: 'You can only view your own applications'
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status
      };

      const result = await RecruitmentCampaignService.getUserApplications(userId, options);

      res.status(200).json({
        success: true,
        message: 'User applications retrieved successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // ========================= SIMPLIFIED APPLICATION MANAGEMENT =========================
  // Controller methods that work with membership IDs directly without requiring campaignId

  /**
   * Update application status (simplified route)
   * PUT /api/clubs/:clubId/applications/:applicationId/status
   */
  static async updateApplicationStatusSimple(req, res) {
    try {
      const { clubId, applicationId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await RecruitmentCampaignService.updateApplicationStatus(
        applicationId, 
        clubId, 
        userId, 
        status, 
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Approve application (simplified route)
   * POST /api/clubs/:clubId/applications/:applicationId/approve
   */
  static async approveApplicationSimple(req, res) {
    try {
      const { clubId, applicationId } = req.params;
      const { role = 'member', notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await RecruitmentCampaignService.approveApplication(
        applicationId, 
        clubId, 
        userId, 
        role, 
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Application approved successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reject application (simplified route)
   * POST /api/clubs/:clubId/applications/:applicationId/reject
   */
  static async rejectApplicationSimple(req, res) {
    try {
      const { clubId, applicationId } = req.params;
      const { reason, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await RecruitmentCampaignService.rejectApplication(
        applicationId, 
        clubId, 
        userId, 
        reason, 
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Application rejected successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('permission') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RecruitmentCampaignController;
