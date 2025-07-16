const express = require('express');
const clubController = require('../controllers/clubController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/clubs/categories
 * @desc Get available club categories for filtering
 * @access Public
 */
router.get('/clubs/categories', authMiddleware.validateApiGatewaySecret, clubController.getCategories);

/**
 * @route GET /api/clubs/locations
 * @desc Get available club locations for filtering
 * @access Public
 */
router.get('/clubs/locations', authMiddleware.validateApiGatewaySecret, clubController.getLocations);

/**
 * @route GET /api/clubs/stats
 * @desc Get club statistics for search context
 * @access Public
 */
router.get('/clubs/stats', authMiddleware.validateApiGatewaySecret, clubController.getStats);

/**
 * @route GET /api/clubs
 * @desc Get all clubs with advanced filtering and search options
 * @access Public
 * @query {string} [search] - Search across name, description, category, location
 * @query {string} [name] - Filter by club name (partial match)
 * @query {string} [category] - Filter by category (exact match)
 * @query {string} [location] - Filter by location (partial match)
 * @query {string} [sort] - Sort by: name, name_desc, category, location, newest, oldest, relevance
 * @query {number} [page] - Page number (default: 1)
 * @query {number} [limit] - Items per page (default: 10, max: 100)
 */
router.get('/clubs', authMiddleware.validateApiGatewaySecret, clubController.getClubs);

/**
 * @route GET /api/clubs/:id
 * @desc Get a club by ID
 * @access Public
 */
router.get('/clubs/:id', authMiddleware.validateApiGatewaySecret, clubController.getClubById);

/**
 * @route GET /api/clubs/:id/recruitments
 * @desc Get all recruitment rounds for a club
 * @access Public
 */
router.get('/clubs/:id/recruitments', authMiddleware.validateApiGatewaySecret, clubController.getClubRecruitments);

/**
 * @route GET /api/clubs/:clubId/members/:userId
 * @desc Get a specific club member's details
 * @access Private (Internal or Club Manager)
 */
router.get('/clubs/:clubId/members/:userId', 
  authMiddleware.validateApiGatewayHeaders, 
  clubController.getClubMember
);

/**
 * @route POST /api/clubs
 * @desc Create a new club
 * @access Private - Requires SYSTEM_ADMIN role
 */
router.post('/clubs', 
  authMiddleware.validateApiGatewayHeaders, 
  authMiddleware.requireRoles([ 'admin']), 
  clubController.createClub
);

module.exports = router;
