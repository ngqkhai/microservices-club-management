const express = require('express');
const RecruitmentCampaignController = require('../controllers/recruitmentCampaignController');

const router = express.Router();

// Recruitment Campaign Routes

/**
 * @route POST /api/clubs/:clubId/campaigns
 * @desc Create a new recruitment campaign
 * @access Private (Club Admin/Organizer)
 */
router.post('/:clubId/campaigns', RecruitmentCampaignController.createCampaign);

/**
 * @route GET /api/clubs/:clubId/campaigns
 * @desc Get all campaigns for a club
 * @access Private (Club Admin/Organizer)
 */
router.get('/:clubId/campaigns', RecruitmentCampaignController.getCampaigns);

/**
 * @route GET /api/clubs/:clubId/campaigns/:campaignId
 * @desc Get campaign by ID
 * @access Public (for active campaigns) / Private (for draft campaigns)
 */
router.get('/:clubId/campaigns/:campaignId', RecruitmentCampaignController.getCampaign);

/**
 * @route PUT /api/clubs/:clubId/campaigns/:campaignId
 * @desc Update campaign
 * @access Private (Club Admin/Organizer)
 */
router.put('/:clubId/campaigns/:campaignId', RecruitmentCampaignController.updateCampaign);

/**
 * @route DELETE /api/clubs/:clubId/campaigns/:campaignId
 * @desc Delete campaign
 * @access Private (Club Admin/Organizer)
 */
router.delete('/:clubId/campaigns/:campaignId', RecruitmentCampaignController.deleteCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/publish
 * @desc Publish campaign (change status from draft to active)
 * @access Private (Club Admin/Organizer)
 */
router.post('/:clubId/campaigns/:campaignId/publish', RecruitmentCampaignController.publishCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/pause
 * @desc Pause campaign
 * @access Private (Club Admin/Organizer)
 */
router.post('/:clubId/campaigns/:campaignId/pause', RecruitmentCampaignController.pauseCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/resume
 * @desc Resume campaign
 * @access Private (Club Admin/Organizer)
 */
router.post('/:clubId/campaigns/:campaignId/resume', RecruitmentCampaignController.resumeCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/complete
 * @desc Complete campaign
 * @access Private (Club Admin/Organizer)
 */
router.post('/:clubId/campaigns/:campaignId/complete', RecruitmentCampaignController.completeCampaign);

module.exports = router;
