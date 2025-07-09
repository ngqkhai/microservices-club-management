const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const extractUserFromHeaders = require('../middlewares/authMiddleware');

// Internal sync route (simple, no auth needed - used by auth service)
router.post('/sync/users', userController.createUser);

// User routes (require JWT authentication)
router.get('/me', extractUserFromHeaders, userController.getUser);
router.put('/me', extractUserFromHeaders, userController.updateUser);
router.get('/me/clubs', extractUserFromHeaders, userController.getUserClubs);

module.exports = router;
