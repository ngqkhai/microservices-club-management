/**
 * Image Service
 * 
 * Handles image uploads, deletions, and metadata management.
 * Uses a pluggable storage provider (Cloudinary or MinIO/S3).
 */

const { getStorage, initializeStorage } = require('../config/storage');
const rabbitmqService = require('../config/rabbitmq');
const ownershipService = require('./ownershipService');
const logger = require('../config/logger');

class ImageService {
  constructor() {
    this.storage = null;
    this.initialized = false;
  }

  /**
   * Initialize the image service
   * Call this on server startup
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      await initializeStorage();
      this.storage = getStorage();
      this.initialized = true;
      logger.info('ImageService initialized', { provider: this.storage.name });
      return true;
    } catch (error) {
      logger.error('ImageService initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Ensure service is initialized before operations
   */
  ensureInitialized() {
    if (!this.initialized || !this.storage) {
      throw new Error('ImageService not initialized. Call initialize() first.');
    }
  }

  /**
   * Upload a single image
   * 
   * @param {Object} file - Multer file object
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(file, options = {}) {
    this.ensureInitialized();

    try {
      const {
        folder = 'club_management',
        public_id = null,
        transformation = [],
        type = 'general', // general, profile, logo, cover, event
        entity_id = null,
        entity_type = null,
        user_id = null
      } = options;

      // Prepare upload options with ownership metadata
      const uploadOptions = ownershipService.addOwnershipMetadata(
        {
          folder: folder,
          public_id: public_id,
          transformation: transformation,
          type: type,
          entity_id: entity_id,
          entity_type: entity_type,
          original_name: file.originalname,
          mime_type: file.mimetype
        },
        user_id,
        entity_id,
        entity_type
      );

      // Upload to storage provider
      const uploadResult = await this.storage.upload(file.buffer, uploadOptions);

      // Prepare image data for RabbitMQ event
      const imageData = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url || uploadResult.url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.size,
        type: type,
        folder: folder,
        original_name: file.originalname,
        uploaded_at: uploadResult.uploaded_at,
        provider: uploadResult.provider,
        // Entity context for database updates
        entity_id: entity_id,
        entity_type: entity_type
      };

      // Publish RabbitMQ event
      try {
        await rabbitmqService.publishImageUploaded(imageData);
      } catch (mqError) {
        // Log but don't fail the upload if RabbitMQ is down
        logger.warn('Failed to publish image event', { error: mqError.message });
      }

      return imageData;
    } catch (error) {
      logger.error('Image upload failed', { error: error.message });
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload multiple images
   * 
   * @param {Array} files - Array of Multer file objects
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleImages(files, options = {}) {
    this.ensureInitialized();

    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      logger.error('Multiple image upload failed', { error: error.message });
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  /**
   * Delete an image
   * 
   * @param {string} publicId - Public ID of the image
   * @param {string} userId - User requesting deletion
   * @param {string} userRole - User's role
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId, userId, userRole) {
    this.ensureInitialized();

    try {
      // Verify ownership before deletion
      const hasAccess = await ownershipService.verifyImageAccess(publicId, userId, userRole);
      
      if (!hasAccess) {
        throw new Error('Access denied: You do not have permission to delete this image');
      }

      const result = await this.storage.delete(publicId);
      
      // Log the deletion for audit purposes
      logger.info('Image deleted', { userId, publicId });
      
      return result;
    } catch (error) {
      logger.error('Image deletion failed', { publicId, error: error.message });
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Get image information
   * 
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<Object>} Image information
   */
  async getImageInfo(publicId) {
    this.ensureInitialized();

    try {
      const result = await this.storage.getInfo(publicId);
      return result;
    } catch (error) {
      logger.error('Failed to get image info', { publicId, error: error.message });
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  /**
   * Get image URL
   * 
   * @param {string} publicId - Public ID of the image
   * @param {Object} options - URL options
   * @returns {string} Image URL
   */
  getImageUrl(publicId, options = {}) {
    this.ensureInitialized();
    return this.storage.getUrl(publicId, options);
  }

  /**
   * Get the current storage provider name
   * @returns {string}
   */
  getProviderName() {
    return this.storage ? this.storage.name : 'not initialized';
  }

  /**
   * Health check for the image service
   * @returns {Object}
   */
  getHealthStatus() {
    return {
      initialized: this.initialized,
      provider: this.getProviderName(),
      configured: this.storage ? this.storage.isConfigured() : false
    };
  }
}

// Export singleton instance
module.exports = new ImageService();
