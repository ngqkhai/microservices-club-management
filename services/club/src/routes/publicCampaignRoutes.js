const express = require('express');
const RecruitmentCampaignController = require('../controllers/recruitmentCampaignController');

const router = express.Router();

// Public Campaign Routes

/**
 * @route GET /api/campaigns/published
 * @desc Get all published campaigns (public endpoint)
 * @access Public
 */
router.get('/published', RecruitmentCampaignController.getPublishedCampaigns);

/**
 * @route GET /api/campaigns/:campaignId
 * @desc Get campaign details by ID (public endpoint for published campaigns)
 * @access Public
 */
router.get('/:campaignId', RecruitmentCampaignController.getCampaignById);

/**
 * @route GET /api/campaigns/clubs/:clubId/published
 * @desc Get published campaigns for a specific club
 * @access Public
 */
router.get('/clubs/:clubId/published', RecruitmentCampaignController.getPublishedCampaigns);

/**
 * @route POST /api/campaigns/:campaignId/apply
 * @desc Submit an application to a recruitment campaign
 * @access Private - Requires authentication
 */
router.post('/:campaignId/apply', RecruitmentCampaignController.submitApplication);

/**
 * @route GET /api/campaigns/:campaignId/applications/:applicationId
 * @desc Get application status and details
 * @access Private - User can only view their own application
 */
router.get('/:campaignId/applications/:applicationId', RecruitmentCampaignController.getApplication);

/**
 * @route PUT /api/campaigns/:campaignId/applications/:applicationId
 * @desc Update an application (only if campaign allows editing)
 * @access Private - User can only edit their own application
 */
router.put('/:campaignId/applications/:applicationId', RecruitmentCampaignController.updateApplication);

/**
 * @route DELETE /api/campaigns/:campaignId/applications/:applicationId
 * @desc Withdraw/cancel an application
 * @access Private - User can only withdraw their own application
 */
router.delete('/:campaignId/applications/:applicationId', RecruitmentCampaignController.withdrawApplication);

module.exports = router;
