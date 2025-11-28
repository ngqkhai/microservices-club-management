const express = require('express');
const clubController = require('../controllers/clubController');
const RecruitmentCampaignController = require('../controllers/recruitmentCampaignController'); // Import controller
const authMiddleware = require('../middlewares/authMiddleware');
const recruitmentCampaignRoutes = require('./recruitmentCampaignRoutes');
const publicCampaignRoutes = require('./publicCampaignRoutes');

const router = express.Router();

/**
 * @route OPTIONS /api/clubs/*
 * @desc Handle CORS preflight requests for all club routes
 * @access Public
 */
router.options('/clubs*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');
  res.status(200).end();
});

/**
 * @route GET /api/clubs/health
 * @desc Health check endpoint for API Gateway
 * @access Public
 */
router.get('/clubs/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'club-service' });
});

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
 * @desc Get a club by ID with additional information including published events
 * @access Public
 * @returns {Object} Club details with current recruitments, upcoming events, published events, and statistics
 */
router.get('/clubs/:id', authMiddleware.validateApiGatewaySecret, clubController.getClubById);

/**
 * @route GET /api/clubs/:id/recruitments
 * @desc Get all recruitment rounds for a club
 * @access Public
 */
router.get('/clubs/:id/recruitments', authMiddleware.validateApiGatewaySecret, clubController.getClubRecruitments);

/**
 * @route GET /api/clubs/:clubId/campaigns/:campaignId
 * @desc Get campaign by ID (Public for published, requires auth for draft)
 * @access Public / Private
 */
router.get(
  '/clubs/:clubId/campaigns/:campaignId',
  authMiddleware.validateApiGatewayHeaders, // Use public gateway validation
  RecruitmentCampaignController.getCampaign
);

/**
 * @route GET /api/clubs/:clubId/members/:userId
 * @desc Get a specific club member's details
 * @access Private - Club Members, Organizers, and Managers
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

/**
 * @route PUT /api/clubs/:id/status
 * @desc Update club status (ACTIVE/INACTIVE)
 * @access Private - Requires SYSTEM_ADMIN role
 */
router.put('/clubs/:id/status',
  authMiddleware.validateApiGatewayHeaders,
  authMiddleware.requireRoles(['admin']),
  clubController.updateClubStatus
);

/**
 * @route GET /api/users/:userId/club-roles
 * @desc Get all club roles for a user
 * @access Private
 */
router.get('/users/:userId/club-roles',
  authMiddleware.validateApiGatewayHeaders,
  clubController.getUserClubRoles
);

/**
 * @route GET /api/users/:userId/applications
 * @desc Get all recruitment applications for a user
 * @access Private - User can only view their own applications
 */
router.get('/users/:userId/applications',
  authMiddleware.validateApiGatewayHeaders,
  require('../controllers/recruitmentCampaignController').getUserApplications
);

/**
 * @route GET /api/clubs/:clubId/members
 * @desc Get all members of a club
 * @access Private - Club Members, Organizers, and Managers
 */
router.get('/clubs/:clubId/members',
  authMiddleware.validateApiGatewayHeaders,
  clubController.getClubMembers
);

/**
 * @route POST /api/clubs/:clubId/members
 * @desc Add a member to a club
 * @access Private - Club Manager only
 */
router.post('/clubs/:clubId/members',
  authMiddleware.validateApiGatewayHeaders,
  clubController.addClubMember
);

/**
 * @route PUT /api/clubs/:clubId/members/:userId/role
 * @desc Update a member's role in a club
 * @access Private - Club Manager only
 */
router.put('/clubs/:clubId/members/:userId/role',
  authMiddleware.validateApiGatewayHeaders,
  clubController.updateMemberRole
);

/**
 * @route DELETE /api/clubs/:clubId/members/:userId
 * @desc Remove a member from a club
 * @access Private - Club Manager only
 */
router.delete('/clubs/:clubId/members/:userId',
  authMiddleware.validateApiGatewayHeaders,
  clubController.removeMember
);

// Protected Campaign Routes (all routes in this file now require JWT)
router.use('/clubs', authMiddleware.validateApiGatewayHeaders, recruitmentCampaignRoutes);

// Public Campaign Routes - mixed authentication
// Public routes (get campaigns) use API Gateway secret
// Application routes use JWT authentication
const publicRouter = express.Router();

// Public campaign viewing routes
publicRouter.get('/published', authMiddleware.validateApiGatewaySecret, require('../controllers/recruitmentCampaignController').getPublishedCampaigns);
publicRouter.get('/:campaignId', authMiddleware.validateApiGatewaySecret, require('../controllers/recruitmentCampaignController').getCampaignById);
publicRouter.get('/clubs/:clubId/published', authMiddleware.validateApiGatewaySecret, require('../controllers/recruitmentCampaignController').getPublishedCampaigns);

// Application routes (require user authentication)
publicRouter.post('/:campaignId/apply', authMiddleware.validateApiGatewayHeaders, require('../controllers/recruitmentCampaignController').submitApplication);
publicRouter.get('/:campaignId/applications/:applicationId', authMiddleware.validateApiGatewayHeaders, require('../controllers/recruitmentCampaignController').getApplication);
publicRouter.put('/:campaignId/applications/:applicationId', authMiddleware.validateApiGatewayHeaders, require('../controllers/recruitmentCampaignController').updateApplication);
publicRouter.delete('/:campaignId/applications/:applicationId', authMiddleware.validateApiGatewayHeaders, require('../controllers/recruitmentCampaignController').withdrawApplication);

router.use('/campaigns', publicRouter);

// Application management routes (user level)
const applicationRoutes = require('./applicationRoutes');
router.use('/applications', authMiddleware.validateApiGatewayHeaders, applicationRoutes);

// Version endpoint for deployment verification
router.get('/clubs/version', (req, res) => {
  res.json({
    service: 'club-service',
    version: '1.0.1',
    deployedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gitCommit: process.env.GIT_COMMIT || 'local-development',
    buildNumber: process.env.BUILD_NUMBER || Date.now().toString()
  });
});

module.exports = router;
