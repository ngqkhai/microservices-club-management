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
 * @desc Get campaigns for a club with optional status filter
 * @query status - Comma-separated list of statuses to filter by (draft,published,completed,paused)
 * @query page - Page number for pagination
 * @query limit - Number of items per page
 * @query sort - Sort field
 * @access Private (Club Manager only)
 * @example /api/clubs/:clubId/campaigns?status=published,draft&page=1&limit=10
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
 * @desc Publish campaign (change status from draft to published)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/publish', RecruitmentCampaignController.publishCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/pause
 * @desc Pause campaign (change status from published to paused)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/pause', RecruitmentCampaignController.pauseCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/resume
 * @desc Resume campaign (change status from paused to published)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/resume', RecruitmentCampaignController.resumeCampaign);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/complete
 * @desc Complete campaign (change status from published to completed)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/complete', RecruitmentCampaignController.completeCampaign);

/**
 * @route GET /api/clubs/:clubId/campaigns/:campaignId/applications
 * @desc Get all applications for a campaign (Club Managers only)
 * @access Private (Club Manager only)
 */
router.get('/:clubId/campaigns/:campaignId/applications', RecruitmentCampaignController.getCampaignApplications);

/**
 * @route GET /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId
 * @desc Get specific application details (Club Managers only)
 * @access Private (Club Manager only)
 */
router.get('/:clubId/campaigns/:campaignId/applications/:applicationId', RecruitmentCampaignController.getApplicationDetails);

/**
 * @route PUT /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/status
 * @desc Update application status (approve, reject, review)
 * @access Private (Club Manager only)
 */
router.put('/:clubId/campaigns/:campaignId/applications/:applicationId/status', RecruitmentCampaignController.updateApplicationStatus);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/approve
 * @desc Approve an application and add user to club
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/applications/:applicationId/approve', RecruitmentCampaignController.approveApplication);

/**
 * @route POST /api/clubs/:clubId/campaigns/:campaignId/applications/:applicationId/reject
 * @desc Reject an application with optional reason
 * @access Private (Club Manager only)
 */
router.post('/:clubId/campaigns/:campaignId/applications/:applicationId/reject', RecruitmentCampaignController.rejectApplication);

// ========================= SIMPLIFIED APPLICATION ROUTES =========================
// Routes that work with membership IDs directly without requiring campaignId

/**
 * @route PUT /api/clubs/:clubId/applications/:applicationId/status
 * @desc Update application status (simplified route without campaignId)
 * @access Private (Club Manager only)
 */
router.put('/:clubId/applications/:applicationId/status', RecruitmentCampaignController.updateApplicationStatusSimple);

/**
 * @route POST /api/clubs/:clubId/applications/:applicationId/approve
 * @desc Approve an application (simplified route without campaignId)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/applications/:applicationId/approve', RecruitmentCampaignController.approveApplicationSimple);

/**
 * @route POST /api/clubs/:clubId/applications/:applicationId/reject
 * @desc Reject an application (simplified route without campaignId)
 * @access Private (Club Manager only)
 */
router.post('/:clubId/applications/:applicationId/reject', RecruitmentCampaignController.rejectApplicationSimple);

module.exports = router;
