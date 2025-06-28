const express = require('express');
const clubController = require('../controllers/clubController');

const router = express.Router();

/**
 * @route GET /api/clubs
 * @desc Get all clubs with filtering options
 * @access Public
 */
router.get('/clubs', clubController.getClubs);

/**
 * @route GET /api/clubs/:id
 * @desc Get a club by ID
 * @access Public
 */
router.get('/clubs/:id', clubController.getClubById);

/**
 * @route GET /api/clubs/:id/recruitments
 * @desc Get all recruitment rounds for a club
 * @access Public
 */
router.get('/clubs/:id/recruitments', clubController.getClubRecruitments);

/**
 * @route POST /api/clubs
 * @desc Create a new club
 * @access Private - Requires SYSTEM_ADMIN role
 */
router.post('/clubs', /* authMiddleware, */ clubController.createClub);

module.exports = router;
