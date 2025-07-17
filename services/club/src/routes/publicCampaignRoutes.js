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
 * @route GET /api/campaigns/clubs/:clubId/published
 * @desc Get published campaigns for a specific club
 * @access Public
 */
router.get('/clubs/:clubId/published', RecruitmentCampaignController.getPublishedCampaigns);

module.exports = router;
