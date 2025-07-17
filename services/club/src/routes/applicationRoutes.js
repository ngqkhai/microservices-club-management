const express = require('express');
const RecruitmentCampaignController = require('../controllers/recruitmentCampaignController');

const router = express.Router();

// Application Management Routes (User Level)

/**
 * @route GET /api/applications/:applicationId
 * @desc Get application details (user can only view their own application)
 * @access Private - User token required
 */
router.get('/:applicationId', RecruitmentCampaignController.getApplication);

/**
 * @route PUT /api/applications/:applicationId
 * @desc Update an application (user can only update their own pending application)
 * @access Private - User token required
 */
router.put('/:applicationId', RecruitmentCampaignController.updateApplication);

/**
 * @route DELETE /api/applications/:applicationId
 * @desc Withdraw/cancel an application (user can only withdraw their own application)
 * @access Private - User token required
 */
router.delete('/:applicationId', RecruitmentCampaignController.withdrawApplication);

module.exports = router;
