// Export all services
export { 
  authService, 
  type User, 
  type LoginRequest, 
  type LoginResponse, 
  type RegisterRequest, 
  type RegisterResponse,
  type ChangePasswordRequest,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
  type ForgotPasswordRequest,
  type ResetPasswordRequest
} from './auth.service';
export { clubService, type Club, type ClubMember, type ClubCategory, type CreateClubRequest, type UpdateClubRequest, type ClubListQuery, type ClubListResponse } from './club.service';
export { eventService, type Event, type EventParticipant, type CreateEventRequest, type UpdateEventRequest, type EventListQuery, type EventListResponse } from './event.service';
export { notificationService, type Notification, type NotificationListQuery, type NotificationListResponse } from './notification.service';
export { campaignService, type Campaign, type CampaignApplication } from './campaign.service';

// Re-export API utilities
export { api, getToken, setToken, removeToken, getRefreshToken, setRefreshToken, type ApiResponse, type ApiError } from '@/lib/api';

// Re-export config
export { default as config } from '@/config';
