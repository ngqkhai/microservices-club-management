/**
 * Cloudinary Storage Provider
 * 
 * Implements the StorageProvider interface for Cloudinary.
 * This is the production storage backend.
 */

const StorageProvider = require('./StorageProvider');
const logger = require('../logger');

class CloudinaryProvider extends StorageProvider {
  constructor() {
    super();
    this.cloudinary = null;
  }

  get name() {
    return 'cloudinary';
  }

  isConfigured() {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  async initialize() {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'
      );
    }

    // Dynamically require cloudinary to avoid errors when not installed
    this.cloudinary = require('cloudinary').v2;
    
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test connection
    try {
      await this.cloudinary.api.ping();
      logger.info('Cloudinary connection verified');
    } catch (error) {
      logger.warn('Cloudinary ping failed (may still work)', { error: error.message });
    }
  }

  async upload(buffer, options = {}) {
    const {
      folder = 'club_management',
      public_id = null,
      type = 'general',
      entity_id = null,
      entity_type = null,
      user_id = null,
      original_name = 'image',
      transformation = []
    } = options;

    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: transformation,
      // Add metadata for ownership tracking
      context: {
        user_id: user_id || '',
        entity_id: entity_id || '',
        entity_type: entity_type || '',
        type: type
      }
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              id: result.public_id,
              public_id: result.public_id,
              url: result.url,
              secure_url: result.secure_url,
              format: result.format,
              width: result.width,
              height: result.height,
              size: result.bytes,
              original_name: original_name,
              uploaded_at: new Date().toISOString(),
              provider: this.name,
              // Additional Cloudinary-specific fields
              version: result.version,
              signature: result.signature
            });
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  }

  async delete(publicId) {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        message: result.result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getInfo(publicId) {
    const result = await this.cloudinary.api.resource(publicId);
    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      created_at: result.created_at,
      provider: this.name
    };
  }

  getUrl(publicId, options = {}) {
    return this.cloudinary.url(publicId, {
      secure: true,
      ...options
    });
  }
}

module.exports = CloudinaryProvider;

