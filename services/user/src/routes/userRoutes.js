const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/me', authMiddleware, userController.updateUser);
router.get('/me/clubs', authMiddleware, userController.getUserClubs);

module.exports = router;
