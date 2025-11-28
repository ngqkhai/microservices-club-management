/**
 * Abstract Storage Provider Interface
 *
 * All storage providers (Cloudinary, MinIO, S3) must implement this interface.
 * This allows the image service to work with different storage backends
 * without changing the business logic.
 */

class StorageProvider {
  /**
   * Provider name for logging
   * @returns {string}
   */
  get name() {
    throw new Error('Must implement name getter');
  }

  /**
   * Initialize the storage provider
   * Called once on server startup
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('Must implement initialize()');
  }

  /**
   * Upload an image to storage
   *
   * @param {Buffer} buffer - The image file buffer
   * @param {Object} options - Upload options
   * @param {string} options.folder - Folder/prefix for the image
   * @param {string} [options.public_id] - Custom public ID (auto-generated if not provided)
   * @param {string} [options.type] - Image type (profile, logo, cover, event, general)
   * @param {string} [options.entity_id] - Related entity ID
   * @param {string} [options.entity_type] - Related entity type (user, club, event)
   * @param {string} [options.user_id] - Uploading user ID
   * @param {string} [options.original_name] - Original filename
   * @param {string} [options.mime_type] - MIME type of the file
   * @returns {Promise<ImageUploadResult>}
   */
  async upload(buffer, options = {}) {
    throw new Error('Must implement upload()');
  }

  /**
   * Delete an image from storage
   *
   * @param {string} publicId - The public ID of the image to delete
   * @returns {Promise<DeleteResult>}
   */
  async delete(publicId) {
    throw new Error('Must implement delete()');
  }

  /**
   * Get information about an image
   *
   * @param {string} publicId - The public ID of the image
   * @returns {Promise<ImageInfo>}
   */
  async getInfo(publicId) {
    throw new Error('Must implement getInfo()');
  }

  /**
   * Generate a public URL for an image
   *
   * @param {string} publicId - The public ID of the image
   * @param {Object} [options] - URL options (transformations, etc.)
   * @returns {string}
   */
  getUrl(publicId, options = {}) {
    throw new Error('Must implement getUrl()');
  }

  /**
   * Check if the storage provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('Must implement isConfigured()');
  }
}

/**
 * @typedef {Object} ImageUploadResult
 * @property {string} id - Unique identifier
 * @property {string} public_id - Public ID for referencing
 * @property {string} url - Public URL of the image
 * @property {string} secure_url - HTTPS URL of the image
 * @property {string} format - Image format (jpg, png, etc.)
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {number} size - File size in bytes
 * @property {string} original_name - Original filename
 * @property {string} uploaded_at - ISO timestamp
 * @property {string} provider - Storage provider name
 */

/**
 * @typedef {Object} DeleteResult
 * @property {boolean} success - Whether deletion was successful
 * @property {string} [message] - Optional message
 */

/**
 * @typedef {Object} ImageInfo
 * @property {string} public_id - Public ID
 * @property {string} url - Public URL
 * @property {string} format - Image format
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 * @property {number} size - Size in bytes
 * @property {string} created_at - Creation timestamp
 */

module.exports = StorageProvider;

