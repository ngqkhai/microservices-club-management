/**
 * MinIO/S3 Storage Provider
 *
 * Implements the StorageProvider interface for MinIO (S3-compatible storage).
 * This is the local development storage backend, but also works with AWS S3.
 *
 * Environment variables:
 * - MINIO_ENDPOINT: MinIO server URL (default: localhost)
 * - MINIO_PORT: MinIO port (default: 9000)
 * - MINIO_ACCESS_KEY: Access key (default: minioadmin)
 * - MINIO_SECRET_KEY: Secret key (default: minioadmin_local_dev)
 * - MINIO_BUCKET: Bucket name (default: club-management)
 * - MINIO_USE_SSL: Use SSL (default: false for local)
 * - MINIO_PUBLIC_URL: Public URL for accessing images (default: http://localhost:9000)
 */

const StorageProvider = require('./StorageProvider');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../logger');

class MinioProvider extends StorageProvider {
  constructor() {
    super();
    this.client = null;
    this.bucket = process.env.MINIO_BUCKET || 'club-management';
    this.publicUrl = process.env.MINIO_PUBLIC_URL ||
                     `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`;
  }

  get name() {
    return 'minio';
  }

  isConfigured() {
    // MinIO has defaults, so it's always "configured" for local dev
    return true;
  }

  async initialize() {
    // Dynamically require minio to avoid errors when not installed
    const Minio = require('minio');

    const endpoint = process.env.MINIO_ENDPOINT || 'minio';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin_local_dev';

    logger.info('Connecting to MinIO', { endpoint, port });

    this.client = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey
    });

    // Ensure bucket exists
    await this.ensureBucket();

    logger.info('MinIO connected', { bucket: this.bucket });
  }

  async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        logger.info('Created bucket', { bucket: this.bucket });

        // Set bucket policy for public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`]
            }
          ]
        };
        await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
        logger.info('Set public read policy on bucket', { bucket: this.bucket });
      }
    } catch (error) {
      // Bucket might already exist or policy might already be set
      if (!error.message.includes('already exists')) {
        logger.warn('Bucket setup warning', { bucket: this.bucket, error: error.message });
      }
    }
  }

  /**
   * Generate a unique object key for the image
   */
  generateObjectKey(options) {
    const { folder = 'general', type = 'image', original_name = 'image' } = options;
    const ext = path.extname(original_name) || '.jpg';
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Short UUID

    return `${folder}/${type}/${timestamp}-${uuid}${ext}`;
  }

  async upload(buffer, options = {}) {
    const {
      folder = 'club_management',
      public_id = null,
      type = 'general',
      entity_id = null,
      entity_type = null,
      user_id = null,
      original_name = 'image.jpg',
      mime_type = 'image/jpeg'
    } = options;

    // Generate object key (path in bucket)
    const objectKey = public_id || this.generateObjectKey({ folder, type, original_name });

    // Metadata for the object
    const metadata = {
      'x-amz-meta-user-id': user_id || '',
      'x-amz-meta-entity-id': entity_id || '',
      'x-amz-meta-entity-type': entity_type || '',
      'x-amz-meta-type': type,
      'x-amz-meta-original-name': original_name,
      'Content-Type': mime_type
    };

    try {
      // Upload to MinIO
      await this.client.putObject(
        this.bucket,
        objectKey,
        buffer,
        buffer.length,
        metadata
      );

      // Get image dimensions (basic detection for common formats)
      const dimensions = this.getImageDimensions(buffer);

      // Generate public URL
      const url = this.getUrl(objectKey);

      return {
        id: objectKey,
        public_id: objectKey,
        url: url,
        secure_url: url, // MinIO doesn't differentiate
        format: path.extname(original_name).slice(1) || 'jpg',
        width: dimensions.width,
        height: dimensions.height,
        size: buffer.length,
        original_name: original_name,
        uploaded_at: new Date().toISOString(),
        provider: this.name,
        bucket: this.bucket
      };
    } catch (error) {
      logger.error('MinIO upload error', { error: error.message });
      throw new Error(`Failed to upload to MinIO: ${error.message}`);
    }
  }

  /**
   * Basic image dimension detection
   * For production, consider using 'sharp' or 'image-size' package
   */
  getImageDimensions(buffer) {
    // Try to detect PNG dimensions
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      // PNG
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
      };
    }

    // Try to detect JPEG dimensions
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      // JPEG - simplified detection
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) {break;}
        const marker = buffer[offset + 1];

        // SOF0, SOF1, SOF2 markers contain dimensions
        if (marker >= 0xC0 && marker <= 0xC2) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7)
          };
        }

        // Skip to next marker
        const length = buffer.readUInt16BE(offset + 2);
        offset += length + 2;
      }
    }

    // Default/unknown
    return { width: 0, height: 0 };
  }

  async delete(publicId) {
    try {
      await this.client.removeObject(this.bucket, publicId);
      return {
        success: true,
        message: 'Object deleted'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getInfo(publicId) {
    try {
      const stat = await this.client.statObject(this.bucket, publicId);

      return {
        public_id: publicId,
        url: this.getUrl(publicId),
        secure_url: this.getUrl(publicId),
        format: path.extname(publicId).slice(1) || 'unknown',
        width: 0, // MinIO doesn't store dimensions in metadata by default
        height: 0,
        size: stat.size,
        created_at: stat.lastModified.toISOString(),
        provider: this.name,
        etag: stat.etag,
        metadata: stat.metaData
      };
    } catch (error) {
      throw new Error(`Failed to get object info: ${error.message}`);
    }
  }

  getUrl(publicId, _options = {}) {
    // For local development, use the public URL
    return `${this.publicUrl}/${this.bucket}/${publicId}`;
  }

  /**
   * Generate a presigned URL for temporary access
   * Useful for private buckets
   */
  async getPresignedUrl(publicId, expirySeconds = 3600) {
    try {
      return await this.client.presignedGetObject(this.bucket, publicId, expirySeconds);
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * List objects in a folder
   */
  async listObjects(prefix = '', recursive = true) {
    return new Promise((resolve, reject) => {
      const objects = [];
      const stream = this.client.listObjects(this.bucket, prefix, recursive);

      stream.on('data', (obj) => objects.push(obj));
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }
}

module.exports = MinioProvider;

