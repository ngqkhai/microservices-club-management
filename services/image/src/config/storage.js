/**
 * Storage Configuration
 *
 * This module provides a unified interface for object storage,
 * supporting both Cloudinary (production) and MinIO/S3 (local development).
 *
 * The storage provider is selected based on environment variables:
 * - STORAGE_PROVIDER=cloudinary (default for production)
 * - STORAGE_PROVIDER=minio (for local development)
 * - STORAGE_PROVIDER=s3 (for AWS S3)
 */

const StorageProvider = require('./storage/StorageProvider');
const CloudinaryProvider = require('./storage/CloudinaryProvider');
const MinioProvider = require('./storage/MinioProvider');
const logger = require('./logger');

/**
 * Get the configured storage provider
 * @returns {StorageProvider} The storage provider instance
 */
function getStorageProvider() {
  const provider = process.env.STORAGE_PROVIDER || 'auto';

  // Auto-detect: Use Cloudinary if configured, otherwise MinIO
  if (provider === 'auto') {
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                          process.env.CLOUDINARY_API_KEY &&
                          process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      logger.info('Storage provider selected', { provider: 'Cloudinary', mode: 'auto-detected' });
      return new CloudinaryProvider();
    } else {
      logger.info('Storage provider selected', { provider: 'MinIO', mode: 'auto-detected', reason: 'Cloudinary not configured' });
      return new MinioProvider();
    }
  }

  switch (provider.toLowerCase()) {
    case 'cloudinary':
      logger.info('Storage provider selected', { provider: 'Cloudinary' });
      return new CloudinaryProvider();

    case 'minio':
    case 's3':
      logger.info('Storage provider selected', { provider: provider.toUpperCase() });
      return new MinioProvider();

    default:
      logger.warn('Unknown storage provider, falling back to MinIO', { provider });
      return new MinioProvider();
  }
}

// Singleton instance
let storageInstance = null;

/**
 * Get or create the storage provider instance
 * @returns {StorageProvider}
 */
function getStorage() {
  if (!storageInstance) {
    storageInstance = getStorageProvider();
  }
  return storageInstance;
}

/**
 * Initialize storage (call this on server startup)
 * @returns {Promise<boolean>}
 */
async function initializeStorage() {
  const storage = getStorage();
  try {
    await storage.initialize();
    logger.info('Storage initialized successfully');
    return true;
  } catch (error) {
    logger.error('Storage initialization failed', { error: error.message });
    return false;
  }
}

module.exports = {
  getStorage,
  getStorageProvider,
  initializeStorage
};

