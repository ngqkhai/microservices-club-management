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
 * Club member interface
 */
export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
  async getClubMembers(id: string): Promise<ApiResponse<ClubMember[]>> {
    return api.get<ClubMember[]>(config.endpoints.clubs.members(id));
  }
}

// Export singleton instance
export const clubService = new ClubService();
export default clubService;
