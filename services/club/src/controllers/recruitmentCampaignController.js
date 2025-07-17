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
}

module.exports = RecruitmentCampaignController;
