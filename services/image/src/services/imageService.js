const cloudinary = require('../config/cloudinary');
const rabbitmqService = require('../config/rabbitmq');
const ownershipService = require('./ownershipService');

class ImageService {
  async uploadImage(file, options = {}) {
    try {
      const {
        folder = 'club_management',
        public_id = null,
        transformation = [],
        type = 'general', // general, profile, logo, cover, event
        entity_id = null,
        entity_type = null,
        user_id = null // Add user_id for ownership tracking
      } = options;

      // Prepare upload options with ownership metadata
      const uploadOptions = ownershipService.addOwnershipMetadata(
        {
          folder: folder,
          public_id: public_id,
          transformation: transformation,
          resource_type: 'image'
        },
        user_id,
        entity_id,
        entity_type
      );

      // Upload to Cloudinary with ownership metadata
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(file.buffer);
      });

      // Prepare image data for RabbitMQ event
      const imageData = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes,
        type: type,
        folder: folder,
        original_name: file.originalname,
        uploaded_at: new Date().toISOString(),
        // Entity context for database updates
        entity_id: entity_id,
        entity_type: entity_type
      };

      // Publish RabbitMQ event
      await rabbitmqService.publishImageUploaded(imageData);

      return imageData;
    } catch (error) {
      console.error('❌ Image upload failed:', error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      const results = await Promise.all(uploadPromises);
      
      return results;
    } catch (error) {
      console.error('❌ Multiple image upload failed:', error.message);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  async deleteImage(publicId, userId, userRole) {
    try {
      // Verify ownership before deletion
      const hasAccess = await ownershipService.verifyImageAccess(publicId, userId, userRole);
      
      if (!hasAccess) {
        throw new Error('Access denied: You do not have permission to delete this image');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      // Log the deletion for audit purposes
      console.log(`🗑️ Image deleted by user ${userId}: ${publicId}`);
      
      return result;
    } catch (error) {
      console.error('❌ Image deletion failed:', error.message);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('❌ Failed to get image info:', error.message);
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }
}

module.exports = new ImageService();
