const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/api/users/me', auth, userController.getMe);
router.put('/api/users/me', auth, userController.updateMe);

module.exports = router;