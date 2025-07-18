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
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  isPublic?: boolean;
  clubId: string;
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
  clubId?: string;
  status?: string;
  isPublic?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
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
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = searchParams.toString() 
      ? `${config.endpoints.events.list}?${searchParams.toString()}`
      : config.endpoints.events.list;

    return api.get<EventListResponse>(endpoint, { skipAuth: true });
  }

  /**
   * Get event by ID
   */
  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return api.get<Event>(config.endpoints.events.detail(id), { skipAuth: true });
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
   * Register for event
   */
  async registerForEvent(id: string): Promise<ApiResponse<EventParticipant>> {
    return api.post<EventParticipant>(config.endpoints.events.register(id));
  }

  /**
   * Unregister from event
   */
  async unregisterFromEvent(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.events.unregister(id));
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
    return this.getEvents({ ...query, clubId });
  }
}

// Export singleton instance
export const eventService = new EventService();
export default eventService;
