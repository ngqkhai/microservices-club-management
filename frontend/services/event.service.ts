import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Event interface
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  isPublic: boolean;
  clubId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  club?: {
    id: string;
    name: string;
    logo?: string;
  };
}

/**
 * Event participant interface
 */
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Create event request interface
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  short_description?: string;
  category?: string;
  event_type?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location: string;
  detailed_location?: string;
  max_participants?: number;
  participation_fee?: number;
  currency?: string;
  registration_deadline?: string;
  requirements?: string[];
  tags?: string[];
  visibility?: 'public' | 'club_members';
  allow_registration?: boolean;
  club_id: string;
  // Additional fields
  agenda?: Array<{
    time: string;
    activity: string;
  }>;
  resources?: Array<{
    name: string;
    type: string;
    url: string;
    size?: string;
  }>;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  social_links?: {
    facebook?: string;
    instagram?: string;
    discord?: string;
  };
  venue_capacity?: number;
  organizer?: {
    user_id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
  };
}

/**
 * Update event request interface
 */
export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

/**
 * Event list query parameters
 */
export interface EventListQuery {
  page?: number;
  limit?: number;
  club_id?: string;
  status?: string;
  category?: string;
  location?: string;
  search?: string;
  start_from?: string;
  start_to?: string;
  filter?: 'upcoming' | 'all';
}

/**
 * Event list response interface
 */
export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Event service class
 */
class EventService {
  /**
   * Get events list
   */
  async getEvents(query: EventListQuery = {}): Promise<ApiResponse<EventListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (query.page) searchParams.append('page', String(query.page));
    if (query.limit) searchParams.append('limit', String(query.limit));
    if (query.club_id) searchParams.append('club_id', query.club_id);
    if (query.status) searchParams.append('status', query.status);
    if (query.category) searchParams.append('category', query.category);
    if (query.location) searchParams.append('location', query.location);
    if (query.search) searchParams.append('search', query.search);
    if (query.start_from) searchParams.append('start_from', query.start_from);
    if (query.start_to) searchParams.append('start_to', query.start_to);
    if (query.filter) searchParams.append('filter', query.filter);

    const endpoint = searchParams.toString() 
      ? `${config.endpoints.events.list}?${searchParams.toString()}`
      : config.endpoints.events.list;

    return api.get<EventListResponse>(endpoint, { skipAuth: true });
  }

  /**
   * Get event by ID
   */
  async getEvent(id: string): Promise<ApiResponse<Event>> {
    // Include auth to receive user-specific status (registration, favorite)
    return api.get<Event>(config.endpoints.events.detail(id));
  }

  /**
   * Create new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    return api.post<Event>(config.endpoints.events.create, eventData);
  }

  /**
   * Update event
   */
  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<ApiResponse<Event>> {
    return api.put<Event>(config.endpoints.events.update(id), eventData);
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(config.endpoints.events.delete(id));
  }

  /**
   * Get event registrations (manager)
   */
  async getEventRegistrations(eventId: string, query: { page?: number; limit?: number; status?: string } = {}): Promise<ApiResponse<{ registrations: any[]; meta?: any }>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.status) params.append('status', String(query.status));
    const qs = params.toString();
    return api.get<{ registrations: any[]; meta?: any }>(`/api/events/${eventId}/registrations${qs ? `?${qs}` : ''}`);
  }

  /**
   * Update registration status (manager)
   */
  async updateRegistrationStatus(eventId: string, registrationId: string, status: string): Promise<ApiResponse<any>> {
    // Assuming PUT /api/events/:id/registrations/:regId/status (not yet defined in config)
    return api.put<any>(`/api/events/${eventId}/registrations/${registrationId}/status`, { status });
  }

  /**
   * Register for event
   */
  async registerForEvent(id: string): Promise<ApiResponse<EventParticipant>> {
    // Deprecated in backend; prefer joinEvent
    return this.joinEvent(id) as unknown as ApiResponse<EventParticipant>;
  }

  /**
   * Unregister from event
   */
  async unregisterFromEvent(id: string): Promise<ApiResponse<void>> {
    // Deprecated in backend; prefer leaveEvent
    await this.leaveEvent(id);
    return { success: true, data: undefined, message: 'Left event' } as unknown as ApiResponse<void>;
  }

  /**
   * Get my registered events
   */
  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    return api.get<Event[]>(`${config.endpoints.events.list}/my`);
  }

  /**
   * Get events by club
   */
  async getEventsByClub(clubId: string, query: Omit<EventListQuery, 'clubId'> = {}): Promise<ApiResponse<EventListResponse>> {
    return this.getEvents({ ...query, club_id: clubId });
  }

  /** Club manager: get events of a specific club (includes participants_count/attended_count) */
  async getClubEvents(clubId: string, query: { page?: number; limit?: number; status?: string; start_from?: string; start_to?: string } = {}): Promise<ApiResponse<{ data: any[]; meta: any }>> {
    const sp = new URLSearchParams();
    if (query.page) sp.append('page', String(query.page));
    if (query.limit) sp.append('limit', String(query.limit));
    if (query.status) sp.append('status', query.status);
    if (query.start_from) sp.append('start_from', query.start_from);
    if (query.start_to) sp.append('start_to', query.start_to);
    const qs = sp.toString();
    return api.get<{ data: any[]; meta: any }>(`/api/clubs/${clubId}/events${qs ? `?${qs}` : ''}`);
  }

  /** Facets for filters */
  async getEventCategories(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>('/api/events/categories', { skipAuth: true });
  }

  async getEventLocations(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>('/api/events/locations', { skipAuth: true });
  }

  /** Toggle favorite for an event */
  async toggleFavorite(eventId: string): Promise<ApiResponse<{ is_favorited: boolean }>> {
    return api.post<{ is_favorited: boolean }>(`/api/events/${eventId}/favorite`);
  }

  /** Get user's favorite events */
  async getUserFavoriteEvents(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<{ events: any[]; meta: any }>> {
    const sp = new URLSearchParams();
    if (params.page) sp.append('page', String(params.page));
    if (params.limit) sp.append('limit', String(params.limit));
    const qs = sp.toString();
    return api.get<{ events: any[]; meta: any }>(`/api/users/favorite-events${qs ? `?${qs}` : ''}`);
  }

  /** Join and Leave event */
  async joinEvent(eventId: string): Promise<ApiResponse<any>> {
    return api.post<any>(`/api/events/${eventId}/join`);
  }

  async leaveEvent(eventId: string): Promise<ApiResponse<any>> {
    return api.delete<any>(`/api/events/${eventId}/leave`);
  }

  /** Get user-specific status for an event */
  async getUserEventStatus(eventId: string): Promise<ApiResponse<{ registration_status: string; is_favorited: boolean; can_register: boolean }>> {
    return api.get<{ registration_status: string; is_favorited: boolean; can_register: boolean }>(`/api/events/${eventId}/user-status`);
  }
}

// Export singleton instance
export const eventService = new EventService();
export default eventService;
