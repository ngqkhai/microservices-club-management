const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

class OwnershipService {
  /**
   * Verify if a user can access/delete an image
   * @param {string} publicId - Cloudinary public ID
   * @param {string} userId - User ID from JWT
   * @param {string} userRole - User role from JWT
   * @returns {Promise<boolean>} - Whether user has access
   */
  async verifyImageAccess(publicId, userId, userRole) {
    try {
      // Admins can access any image
      if (userRole === 'admin') {
        return true;
      }

      // Get image metadata from Cloudinary
      const imageInfo = await cloudinary.api.resource(publicId);
      
      // Check if image has context tags that indicate ownership
      const tags = imageInfo.tags || [];
      const context = imageInfo.context || {};
      
      // Look for user_id in tags or context
      const imageUserId = context.user_id || this.extractUserIdFromTags(tags);
      
      if (imageUserId === userId) {
        return true;
      }

      // For club/event images, we could check if user is club manager
      // This would require additional service calls to verify club membership
      
      return false;
    } catch (error) {
      logger.error('Ownership verification failed', { publicId, error: error.message });
      
      // If we can't verify ownership (e.g., image doesn't exist), deny access
      return false;
    }
  }

  /**
   * Add ownership metadata when uploading images
   * @param {Object} uploadOptions - Cloudinary upload options
   * @param {string} userId - User ID
   * @param {string} entityId - Entity ID (club_id, event_id, etc.)
   * @param {string} entityType - Entity type (club, event, user)
   * @returns {Object} - Enhanced upload options with ownership metadata
   */
  addOwnershipMetadata(uploadOptions, userId, entityId, entityType) {
    return {
      ...uploadOptions,
      context: {
        user_id: userId,
        entity_id: entityId,
        entity_type: entityType,
        uploaded_at: new Date().toISOString()
      },
      tags: [
        `user_${userId}`,
        entityType ? `type_${entityType}` : 'type_general',
        entityId ? `entity_${entityId}` : 'entity_none'
      ]
    };
  }

  /**
   * Extract user ID from Cloudinary tags
   * @param {Array} tags - Cloudinary tags array
   * @returns {string|null} - User ID or null
   */
  extractUserIdFromTags(tags) {
    const userTag = tags.find(tag => tag.startsWith('user_'));
    return userTag ? userTag.replace('user_', '') : null;
  }

  /**
   * Verify club manager or organizer permissions
   * @param {string} clubId - Club ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Whether user is club manager or organizer
   */
  async verifyClubManagerAccess(clubId, userId) {
    try {
      if (!clubId || !userId) {
        return false;
      }

      // Call club service to verify membership
      const clubServiceUrl = process.env.CLUB_SERVICE_URL || 'http://club-service:3002';
      const axios = require('axios');
      
      const response = await axios.get(`${clubServiceUrl}/api/clubs/${clubId}/members/${userId}`, {
        headers: {
          'X-API-Gateway-Secret': process.env.API_GATEWAY_SECRET,
          'X-User-Id': userId,  // Required for club service authorization
          'X-User-Role': 'user'  // Minimum role to check membership
        },
        timeout: 5000
      });

      // Check if user is club manager or organizer
      const membershipData = response.data.data;  // Club service returns { success, message, data }
      return membershipData.role === 'club_manager' || membershipData.role === 'organizer';
      
    } catch (error) {
      logger.error('Club manager verification failed', { clubId, userId, error: error.message });
      
      // If club service is unreachable, deny access for safety
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.warn('Club service unreachable - denying access for safety');
        return false;
      }
      
      // If user not found (404), they're not a member
      if (error.response && error.response.status === 404) {
        return false;
      }
      
      return false;
    }
  }

  /**
   * Verify event permissions (creator, event organizer, or club manager/organizer)
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Whether user can modify event images
   */
  async verifyEventAccess(eventId, userId) {
    try {
      if (!eventId || !userId) {
        return false;
      }

      // Call event service to get event details
      const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3003';
      const axios = require('axios');
      
      const eventResponse = await axios.get(`${eventServiceUrl}/api/events/${eventId}`, {
        headers: {
          'X-API-Gateway-Secret': process.env.API_GATEWAY_SECRET
        },
        timeout: 5000
      });

      const event = eventResponse.data;
      
      // Check if user created the event
      if (event.created_by === userId) {
        return true;
      }

      // Check if user is an organizer of the event
      if (event.organizers && Array.isArray(event.organizers)) {
        const isOrganizer = event.organizers.some(org => org.user_id === userId);
        if (isOrganizer) {
          return true;
        }
      }

      // Check if user is manager or organizer of the club that owns the event
      if (event.club_id) {
        return await this.verifyClubManagerAccess(event.club_id.toString(), userId);
      }

      return false;
      
    } catch (error) {
      logger.error('Event access verification failed', { eventId, userId, error: error.message });
      
      // If event service is unreachable, deny access for safety
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.warn('Event service unreachable - denying access for safety');
        return false;
      }
      
      // If event not found (404), deny access
      if (error.response && error.response.status === 404) {
        return false;
      }
      
      return false;
    }
  }
}

module.exports = new OwnershipService();
