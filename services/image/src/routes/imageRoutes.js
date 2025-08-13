const express = require('express');
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/uploadMiddleware');
const { 
  validateApiGatewaySecret, 
  extractUserInfo, 
  requireAuth, 
  requireClubManagerOrAdmin 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply API Gateway secret validation to all routes except health
router.use((req, res, next) => {
  // Skip validation for health endpoint
  if (req.path === '/health') {
    return next();
  }
  validateApiGatewaySecret(req, res, next);
});

// Extract user info from JWT headers for protected routes
router.use((req, res, next) => {
  // Skip for health endpoint
  if (req.path === '/health') {
    return next();
  }
  extractUserInfo(req, res, next);
});

// Health check endpoint for Kong routing
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'image-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Upload single image (requires authentication and authorization)
router.post('/upload', 
  requireAuth,
  requireClubManagerOrAdmin,
  upload.single('image'), 
  imageController.uploadSingleImage
);

// Upload multiple images (requires authentication and authorization)
router.post('/upload/bulk', 
  requireAuth,
  requireClubManagerOrAdmin,
  upload.array('images', 10), // Max 10 images
  imageController.uploadMultipleImages
);

// Delete image (requires authentication and ownership verification)
router.delete('/:publicId', 
  requireAuth,
  imageController.deleteImage
);

// Get image info (requires authentication)
router.get('/:publicId', 
  requireAuth,
  imageController.getImageInfo
);

module.exports = router;
