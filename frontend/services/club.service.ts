import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Club interface based on API documentation
 */
export interface Club {
  id: string;
  name: string;
  description?: string;
  category: 'academic' | 'sports' | 'arts' | 'technology' | 'social' | 'volunteer' | 'cultural' | 'other';
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  cover_url?: string;
  website_url?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  settings?: {
    is_public: boolean;
    requires_approval: boolean;
    max_members?: number;
  };
  status: string;
  member_count: number;
  created_by?: string;
  manager?: {
    user_id: string;
    full_name: string;
    email?: string;
  };
  created_at: Date;
  // Backward compatibility
  type?: string;
  size?: number;
}

/**
 * Recruitment interface
 */
export interface Recruitment {
  id: string;
  club_id: string;
  club_name: string;
  title: string;
  description: string;
  requirements: string[];
  application_questions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
    required: boolean;
    max_length?: number;
    options?: string[];
    _id?: string;
  }>;
  start_date: string;
  end_date: string;
  max_applications: number;
  applications_count: number;
  status: string;
  statistics?: {
    total_applications: number;
    approved_applications: number;
    rejected_applications: number;
    pending_applications: number;
    last_updated?: string;
  };
  created_at: string;
  updated_at?: string;
}

/**
 * Event interface
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  location?: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    location_type?: string;
    type?: string;
    address?: string;
    room?: string;
  };
  fee?: number;
  participation_fee?: number;
  currency?: string;
  max_participants: number;
  current_participants?: number;
  status: string;
  visibility?: string;
  statistics?: {
    total_registrations?: number;
    total_interested?: number;
    total_attended?: number;
    _id?: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Detailed club interface from API response (following CLUB_MEMBERS_APPLICATIONS_API.md)
 */
export interface ClubDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  cover_url: string;
  website_url?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  settings?: {
    is_public: boolean;
    requires_approval: boolean;
    max_members?: number;
  };
  status: string;
  member_count: number;
  created_by?: string;
  manager: {
    user_id: string;
    full_name: string;
    email: string;
    assigned_at?: string;
  };
  size?: number;
  current_recruitments: Array<{
    id: string;
    title: string;
    description: string;
    requirements: string[];
    start_date: string;
    end_date: string;
    max_applications: number;
    applications_count: number;
    status: string;
  }>;
  total_recruitments: number;
  active_recruitments: number;
  published_events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    participants_count: number;
    status: string;
  }>;
  completed_events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    participants_count: number;
    status: string;
  }>;
  total_events: number;
  published_events_count: number;
  completed_events_count: number;
}

/**
 * Club member interface based on API documentation
 */
export interface ClubMember {
  _id: string;
  user_id: string;
  user_full_name: string;
  user_email?: string;
  role: 'club_manager' | 'organizer' | 'member';
  joined_at: string;
}

/**
 * User application interface
 */
export interface UserApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  role: string;
  application_message: string;
  application_answers: Array<{
    question: string;
    answer: string;
  }>;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  campaign: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  club: {
    id: string;
    name: string;
    description: string;
    logo: string;
  };
}

/**
 * User applications response
 */
export interface UserApplicationsResponse {
  applications: UserApplication[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

/**
 * Campaign interface based on API documentation
 */
export interface Campaign {
  id: string;
  club_id: string;
  title: string;
  description: string;
  requirements: string[];
  application_questions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
    required: boolean;
    max_length?: number;
    options?: string[];
  }>;
  start_date: string;
  end_date: string;
  max_applications?: number;
  status: 'draft' | 'published' | 'paused' | 'completed';
  statistics?: {
    total_applications: number;
    approved_applications: number;
    rejected_applications: number;
    pending_applications: number;
    last_updated: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Campaign list query parameters
 */
export interface CampaignListQuery {
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Campaign list response interface
 */
export interface CampaignListResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

/**
 * Club category interface
 */
export interface ClubCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * Create club request interface
 */
export interface CreateClubRequest {
  name: string;
  description: string;
  category: string;
  logo?: string;
  cover_url?: string;
  banner?: string;
  maxMembers?: number;
  isPublic?: boolean;
}

/**
 * Update club request interface
 */
export interface UpdateClubRequest extends Partial<CreateClubRequest> {}

/**
 * Club list query parameters based on API documentation
 */
export interface ClubListQuery {
  search?: string;
  name?: string;
  category?: string;
  location?: string;
  sort?: 'name' | 'name_desc' | 'category' | 'location' | 'newest' | 'oldest' | 'relevance';
  page?: number;
  limit?: number;
}

/**
 * Club list response interface based on API documentation
 */
export interface ClubListResponse {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  results: Club[];
}

/**
 * Club service class
 */
class ClubService {
  /**
   * Get clubs list
   */
  async getClubs(query: ClubListQuery = {}): Promise<ApiResponse<ClubListResponse>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = searchParams.toString() 
      ? `${config.endpoints.clubs.list}?${searchParams.toString()}`
      : config.endpoints.clubs.list;

    return api.get<ClubListResponse>(endpoint, { skipAuth: true });
  }

  /**
   * Get club by ID
   */
  async getClub(id: string): Promise<ApiResponse<Club>> {
    return api.get<Club>(config.endpoints.clubs.detail(id), { skipAuth: true });
  }

  /**
   * Get detailed club information by ID
   */
  async getClubDetail(id: string): Promise<ApiResponse<ClubDetail>> {
    const response = await api.get<ClubDetail>(config.endpoints.clubs.detail(id), { skipAuth: true })
    return response;
  }

  /**
   * Create new club
   */
  async createClub(clubData: CreateClubRequest): Promise<ApiResponse<Club>> {
    return api.post<Club>(config.endpoints.clubs.create, clubData);
  }

  /**
   * Update club
   */
  async updateClub(id: string, clubData: UpdateClubRequest): Promise<ApiResponse<Club>> {
    return api.put<Club>(config.endpoints.clubs.update(id), clubData);
  }

  /**
   * Delete club
   */
  async deleteClub(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(config.endpoints.clubs.delete(id));
  }

  /**
   * Get club categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>(config.endpoints.clubs.categories, { skipAuth: true });
  }

  /**
   * Join club
   */
  async joinClub(id: string): Promise<ApiResponse<ClubMember>> {
    return api.post<ClubMember>(config.endpoints.clubs.join(id));
  }

  /**
   * Leave club
   */
  async leaveClub(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(config.endpoints.clubs.leave(id));
  }

  /**
   * Get club members
   */
  async getClubMembers(clubId: string): Promise<ApiResponse<ClubMember[]>> {
    return api.get<ClubMember[]>(`/api/clubs/${clubId}/members`);
  }

  /**
   * Add club member
   */
  async addClubMember(clubId: string, userId: string, role: string = 'member'): Promise<ApiResponse<ClubMember>> {
    return api.post<ClubMember>(`/api/clubs/${clubId}/members`, { userId, role });
  }

  /**
   * Update member role
   */
  async updateMemberRole(clubId: string, userId: string, role: string): Promise<ApiResponse<ClubMember>> {
    return api.put<ClubMember>(`/api/clubs/${clubId}/members/${userId}/role`, { role });
  }

  /**
   * Remove club member
   */
  async removeClubMember(clubId: string, userId: string): Promise<ApiResponse<ClubMember>> {
    return api.delete<ClubMember>(`/api/clubs/${clubId}/members/${userId}`);
  }

  /**
   * Get user applications
   */
  async getUserApplications(
    userId: string, 
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<UserApplicationsResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const endpoint = searchParams.toString() 
      ? `/api/users/${userId}/applications?${searchParams.toString()}`
      : `/api/users/${userId}/applications`;

    return api.get<UserApplicationsResponse>(endpoint);
  }

  /**
   * Get club campaigns
   */
  async getClubCampaigns(
    clubId: string,
    params?: CampaignListQuery
  ): Promise<ApiResponse<CampaignListResponse['data']>> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = searchParams.toString() 
      ? `/api/clubs/${clubId}/campaigns?${searchParams.toString()}`
      : `/api/clubs/${clubId}/campaigns`;

    return api.get<CampaignListResponse['data']>(endpoint);
  }

  /**
   * Get specific campaign details
   */
  async getCampaignDetail(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.get<Campaign>(`/api/clubs/${clubId}/campaigns/${campaignId}`);
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(clubId: string, campaignId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/clubs/${clubId}/campaigns/${campaignId}`);
  }

  /**
   * Update campaign - PUT /api/clubs/{clubId}/campaigns/{campaignId}
   */
  async updateCampaign(clubId: string, campaignId: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return api.put<Campaign>(`/api/clubs/${clubId}/campaigns/${campaignId}`, data);
  }

  /**
   * Get campaign applications - GET /api/clubs/{clubId}/campaigns/{campaignId}/applications
   */
  async getCampaignApplications(
    clubId: string, 
    campaignId: string, 
    query?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<{ applications: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    
    const queryString = params.toString();
    const url = `/api/clubs/${clubId}/campaigns/${campaignId}/applications${queryString ? `?${queryString}` : ''}`;
    
    return api.get<{ applications: any[]; pagination: any }>(url);
  }

  /**
   * Update campaign status - PUT /api/clubs/{clubId}/campaigns/{campaignId}/status
   */
  async updateCampaignStatus(clubId: string, campaignId: string, status: string): Promise<ApiResponse<Campaign>> {
    return api.put<Campaign>(`/api/clubs/${clubId}/campaigns/${campaignId}/status`, { status });
  }

  /**
   * Get application details - GET /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}
   */
  async getApplicationDetail(clubId: string, campaignId: string, applicationId: string): Promise<ApiResponse<any>> {
    return api.get<any>(`/api/clubs/${clubId}/campaigns/${campaignId}/applications/${applicationId}`);
  }

  /**
   * Approve application (Simplified) - POST /api/clubs/{clubId}/applications/{applicationId}/approve
   */
  async approveApplication(clubId: string, applicationId: string, data?: {
    role?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return api.post<any>(`/api/clubs/${clubId}/applications/${applicationId}/approve`, data);
  }

  /**
   * Reject application (Simplified) - POST /api/clubs/{clubId}/applications/{applicationId}/reject
   */
  async rejectApplication(clubId: string, applicationId: string, data?: {
    reason?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return api.post<any>(`/api/clubs/${clubId}/applications/${applicationId}/reject`, data);
  }
}

// Export singleton instance
export const clubService = new ClubService();
export default clubService;
