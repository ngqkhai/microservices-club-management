const imageService = require('../services/imageService');
const logger = require('../config/logger');

class ImageController {
    async uploadSingleImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const {
        type = 'general',
        folder = 'club_management',
        entity_id,     // club_id, event_id, user_id
        entity_type    // 'club', 'event', 'user'
      } = req.body;

      // Get user info from JWT (set by Kong middleware)
      const userId = req.user.id;
      
      const result = await imageService.uploadImage(req.file, {
        type,
        folder,
        entity_id,
        entity_type,
        user_id: userId  // Add user ID for ownership tracking
      });

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result
      });
    } catch (error) {
      logger.error('Upload error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const { 
        type = 'general', 
        folder = 'club_management',
        entity_id,
        entity_type
      } = req.body;

      // Get user info from JWT (set by Kong middleware)
      const userId = req.user.id;
      
      const results = await imageService.uploadMultipleImages(req.files, {
        type,
        folder,
        entity_id,
        entity_type,
        user_id: userId  // Add user ID for ownership tracking
      });

      res.status(201).json({
        success: true,
        message: `${results.length} images uploaded successfully`,
        data: results
      });
    } catch (error) {
      logger.error('Multiple upload error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteImage(req, res) {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({ error: 'Public ID is required' });
      }

      // Get user info from JWT (set by Kong middleware)
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await imageService.deleteImage(publicId, userId, userRole);

      res.json({
        success: true,
        message: 'Image deleted successfully',
        data: result
      });
    } catch (error) {
      logger.error('Delete error', { publicId: req.params.publicId, error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getImageInfo(req, res) {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({ error: 'Public ID is required' });
      }

      const result = await imageService.getImageInfo(publicId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get info error', { publicId: req.params.publicId, error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ImageController();
