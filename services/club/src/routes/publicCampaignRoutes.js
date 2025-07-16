const express = require('express');
const RecruitmentCampaignController = require('../controllers/recruitmentCampaignController');

const router = express.Router();

// Public Campaign Routes

/**
 * @route GET /api/campaigns/active
 * @desc Get all active campaigns (public endpoint)
 * @access Public
 */
router.get('/active', RecruitmentCampaignController.getActiveCampaigns);

module.exports = router;
