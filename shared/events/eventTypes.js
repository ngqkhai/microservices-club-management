/**
 * Centralized Event Types for RabbitMQ Inter-Service Communication
 * 
 * Naming Convention: {domain}.{entity}.{action}
 * - Domain: user, club, event, campaign, notification
 * - Entity: user, club, event, member, registration
 * - Action: created, updated, deleted, verified, etc.
 */

const EventTypes = {
  // ==================== USER EVENTS ====================
  // Published by: auth-service
  // Consumed by: club-service, event-service
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_EMAIL_VERIFIED: 'user.email.verified',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_PROFILE_PICTURE_UPDATED: 'user.profile.picture.updated',

  // ==================== CLUB EVENTS ====================
  // Published by: club-service
  // Consumed by: event-service, notify-service
  CLUB_CREATED: 'club.created',
  CLUB_UPDATED: 'club.updated',
  CLUB_DELETED: 'club.deleted',
  CLUB_STATUS_CHANGED: 'club.status.changed',
  
  // Member Events
  CLUB_MEMBER_ADDED: 'club.member.added',
  CLUB_MEMBER_REMOVED: 'club.member.removed',
  CLUB_MEMBER_ROLE_CHANGED: 'club.member.role.changed',
  
  // Campaign Events
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_PUBLISHED: 'campaign.published',
  CAMPAIGN_UPDATED: 'campaign.updated',
  CAMPAIGN_STATUS_CHANGED: 'campaign.status.changed',
  CAMPAIGN_DELETED: 'campaign.deleted',
  CAMPAIGN_APPLICATION_SUBMITTED: 'campaign.application.submitted',
  CAMPAIGN_APPLICATION_APPROVED: 'campaign.application.approved',
  CAMPAIGN_APPLICATION_REJECTED: 'campaign.application.rejected',

  // ==================== EVENT EVENTS ====================
  // Published by: event-service
  // Consumed by: notify-service, club-service
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_DELETED: 'event.deleted',
  EVENT_STATUS_CHANGED: 'event.status.changed',
  EVENT_CANCELLED: 'event.cancelled',
  
  // Registration Events
  EVENT_REGISTRATION_CREATED: 'event.registration.created',
  EVENT_REGISTRATION_CANCELLED: 'event.registration.cancelled',
  EVENT_REGISTRATION_CONFIRMED: 'event.registration.confirmed',
  EVENT_ATTENDEE_CHECKED_IN: 'event.attendee.checked_in',

  // ==================== IMAGE EVENTS ====================
  // Published by: image-service
  // Consumed by: club-service, event-service, auth-service
  IMAGE_UPLOADED: 'image.uploaded',
  IMAGE_DELETED: 'image.deleted',
  IMAGE_UPLOAD_FAILED: 'image.upload.failed',

  // ==================== NOTIFICATION EVENTS ====================
  // Published by: Various services
  // Consumed by: notify-service
  SEND_EMAIL_VERIFICATION: 'send.email.verification',
  SEND_EMAIL_PASSWORD_RESET: 'send.email.password.reset',
  SEND_EMAIL_WELCOME: 'send.email.welcome',
  SEND_EMAIL_EVENT_REMINDER: 'send.email.event.reminder',
  SEND_EMAIL_APPLICATION_STATUS: 'send.email.application.status',
  SEND_NOTIFICATION_PUSH: 'send.notification.push',
};

/**
 * Exchange names for different domains
 */
const Exchanges = {
  AUTH: 'auth_events',
  CLUB: 'club_events',
  EVENT: 'event_events',
  IMAGE: 'image_events',
  NOTIFICATION: 'notification_events',
};

/**
 * Queue names for consumers
 */
const Queues = {
  // Auth service queues
  AUTH_EVENTS: 'auth_events_queue',
  
  // Club service queues
  CLUB_USER_SYNC: 'club_user_sync_queue',
  CLUB_IMAGE_EVENTS: 'club_image_events_queue',
  
  // Event service queues
  EVENT_USER_SYNC: 'event_user_sync_queue',
  EVENT_CLUB_SYNC: 'event_club_sync_queue',
  EVENT_IMAGE_EVENTS: 'event_image_events_queue',
  
  // Notify service queues
  NOTIFY_EMAIL: 'notify_email_queue',
  NOTIFY_PUSH: 'notify_push_queue',
  
  // Image service queues
  IMAGE_PROCESSING: 'image_processing_queue',
};

/**
 * Standard event payload structure
 * @typedef {Object} EventPayload
 * @property {string} id - Unique event ID (UUID)
 * @property {string} type - Event type from EventTypes
 * @property {string} source - Service that published the event
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {string} correlationId - For request tracing
 * @property {Object} data - Event-specific data
 * @property {Object} [metadata] - Optional metadata
 */

/**
 * Create a standard event payload
 * @param {string} type - Event type
 * @param {Object} data - Event data
 * @param {string} source - Source service
 * @param {string} [correlationId] - Correlation ID for tracing
 * @returns {EventPayload}
 */
function createEventPayload(type, data, source, correlationId = null) {
  const { v4: uuidv4 } = require('uuid');
  
  return {
    id: uuidv4(),
    type,
    source,
    timestamp: new Date().toISOString(),
    correlationId: correlationId || uuidv4(),
    data,
    metadata: {
      version: '1.0',
      environment: process.env.NODE_ENV || 'development'
    }
  };
}

module.exports = {
  EventTypes,
  Exchanges,
  Queues,
  createEventPayload
};

