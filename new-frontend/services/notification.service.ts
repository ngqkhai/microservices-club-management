import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  userId: string;
  relatedEntityType?: 'club' | 'event' | 'user';
  relatedEntityId?: string;
  createdAt: string;
  readAt?: string;
}

/**
 * Notification list query parameters
 */
export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

/**
 * Notification list response interface
 */
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Notification service class
 */
class NotificationService {
  /**
   * Get notifications list
   */
  async getNotifications(query: NotificationListQuery = {}): Promise<ApiResponse<NotificationListResponse>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = searchParams.toString() 
      ? `${config.endpoints.notifications.list}?${searchParams.toString()}`
      : config.endpoints.notifications.list;

    return api.get<NotificationListResponse>(endpoint);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return api.put<void>(config.endpoints.notifications.markAsRead(id));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return api.put<void>(config.endpoints.notifications.markAllAsRead);
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get<{ count: number }>(`${config.endpoints.notifications.list}/unread-count`);
  }

  /**
   * Get recent notifications (last 10)
   */
  async getRecentNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.getNotifications({ limit: 10 }).then(response => ({
      ...response,
      data: response.data.notifications,
    }));
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
