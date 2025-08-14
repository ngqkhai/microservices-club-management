import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Image upload response interface
 */
export interface ImageUploadResponse {
  id: string;
  url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  size: number;
  type: string;
  folder?: string;
  original_name: string;
  uploaded_at: string;
}

/**
 * Bulk image upload response interface
 */
export interface BulkImageUploadResponse {
  uploaded: ImageUploadResponse[];
  total_uploaded: number;
  message: string;
}

/**
 * Image info response interface
 */
export interface ImageInfoResponse {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
}

/**
 * Image service health response interface
 */
export interface ImageHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}

/**
 * Image type enum
 */
export type ImageType = 'profile' | 'logo' | 'cover' | 'event_image' | 'event_logo' | 'event';

/**
 * Entity type enum
 */
export type EntityType = 'user' | 'club' | 'event';

/**
 * Bulk upload image type enum
 */
export type BulkImageType = 'event' | 'gallery';

/**
 * Image upload parameters interface
 */
export interface UploadImageParams {
  imageFile: File;
  type: ImageType;
  entityId: string;
  entityType: EntityType;
  folder?: string;
}

/**
 * Bulk image upload parameters interface
 */
export interface BulkUploadImageParams {
  imageFiles: File[];
  type: BulkImageType;
  entityId: string;
  entityType: EntityType;
  folder?: string;
}

/**
 * Image service class for handling image uploads via the Image Service API
 */
class ImageService {
  private readonly apiGatewaySecret = process.env.NEXT_PUBLIC_API_GATEWAY_SECRET || 'your_secret_here';

  /**
   * Generic FormData upload method using api utility with proper CORS handling
   */
  private async uploadFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      // Use a direct approach without custom headers that cause CORS issues
      const token = localStorage.getItem(config.jwt.storageKey);
      
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove X-API-Gateway-Secret header to avoid CORS preflight issues
          // The API Gateway should handle authentication via JWT token
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        status: response.status,
        data: data.data || data,
        message: data.message || 'Upload successful',
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Upload failed',
      };
    }
  }

  /**
   * Upload a single image
   */
  async uploadSingleImage(params: UploadImageParams): Promise<ApiResponse<ImageUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('image', params.imageFile);
      formData.append('type', params.type);
      formData.append('entity_id', params.entityId);
      formData.append('entity_type', params.entityType);
      
      if (params.folder) {
        formData.append('folder', params.folder);
      }

      return await this.uploadFormData<ImageUploadResponse>('/api/images/upload', formData);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Failed to upload image',
      };
    }
  }

  /**
   * Upload multiple images (bulk upload)
   */
  async uploadMultipleImages(params: BulkUploadImageParams): Promise<ApiResponse<ImageUploadResponse[]>> {
    try {
      const formData = new FormData();
      
      // Append all image files
      params.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('type', params.type);
      formData.append('entity_id', params.entityId);
      formData.append('entity_type', params.entityType);
      
      if (params.folder) {
        formData.append('folder', params.folder);
      }

      return await this.uploadFormData<ImageUploadResponse[]>('/api/images/upload/bulk', formData);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Failed to upload images',
      };
    }
  }

  /**
   * Delete an image by public_id - using standard authentication
   */
  async deleteImage(publicId: string): Promise<ApiResponse<any>> {
    try {
      // Use standard API call without custom headers to avoid CORS issues
      return await api.delete<any>(`/api/images/${encodeURIComponent(publicId)}`);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Failed to delete image',
      };
    }
  }

  /**
   * Get image info by public_id - using standard authentication
   */
  async getImageInfo(publicId: string): Promise<ApiResponse<ImageInfoResponse>> {
    try {
      // Use standard API call without custom headers to avoid CORS issues
      return await api.get<ImageInfoResponse>(`/api/images/${encodeURIComponent(publicId)}`);
    } catch (error: any) {
      console.error('Error getting image info:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Failed to get image info',
      };
    }
  }

  /**
   * Check image service health
   */
  async healthCheck(): Promise<ApiResponse<ImageHealthResponse>> {
    try {
      return await api.get<ImageHealthResponse>('/api/images/health', { skipAuth: true });
    } catch (error: any) {
      console.error('Error checking image service health:', error);
      return {
        success: false,
        status: error.status || 500,
        data: null as any,
        message: error.message || 'Image service health check failed',
      };
    }
  }

  /**
   * Upload single image with simplified parameters (backward compatibility)
   */
  async uploadImage(
    imageFile: File,
    type: ImageType,
    entityId: string,
    entityType: EntityType,
    folder?: string
  ): Promise<ApiResponse<ImageUploadResponse>> {
    return this.uploadSingleImage({
      imageFile,
      type,
      entityId,
      entityType,
      folder,
    });
  }

  /**
   * Upload multiple images with simplified parameters (backward compatibility)
   */
  async uploadImages(
    imageFiles: File[],
    type: BulkImageType,
    entityId: string,
    entityType: EntityType,
    folder?: string
  ): Promise<ApiResponse<ImageUploadResponse[]>> {
    return this.uploadMultipleImages({
      imageFiles,
      type,
      entityId,
      entityType,
      folder,
    });
  }
}

// Export singleton instance
export const imageService = new ImageService();
export default imageService;
