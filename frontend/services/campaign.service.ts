import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Application Question interface
 */
export interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  max_length?: number;
  options?: string[];
}

/**
 * Campaign Statistics interface
 */
export interface CampaignStatistics {
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  last_updated: string;
}

/**
 * Campaign interface - Updated to match API documentation
 */
export interface Campaign {
  id: string;
  club_id: string;
  club_name?: string;
  title: string;
  description: string;
  requirements: string[];
  application_questions: ApplicationQuestion[];
  start_date: string;
  end_date: string;
  max_applications?: number;
  status: 'draft' | 'published' | 'paused' | 'completed';
  statistics: CampaignStatistics;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Answer object interface
 */
export interface ApplicationAnswer {
  question_id: string;
  answer: string | string[];
}

/**
 * Campaign Application interface - Updated to match API documentation
 */
export interface CampaignApplication {
  id: string;
  campaign_id: string;
  campaign_title?: string;
  club_name?: string;
  club_id?: string;
  user_id: string;
  user_email: string;
  status: 'pending' | 'approved' | 'rejected';
  application_message?: string;
  answers: ApplicationAnswer[];
  submitted_at: string;
  updated_at: string;
  feedback?: string;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

/**
 * Pagination interface
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Campaign service class
 */
class CampaignService {
  /**
   * Get all published campaigns with pagination support
   */
  async getPublishedCampaigns(params?: {
    page?: number;
    limit?: number;
    club_id?: string;
  }): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.club_id) queryParams.set('club_id', params.club_id);
    
    const url = `${config.endpoints.campaigns.published}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get<PaginatedResponse<Campaign>>(url, { skipAuth: true });
  }

  /**
   * Get published campaigns for a specific club
   */
  async getClubPublishedCampaigns(clubId: string): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    return api.get<PaginatedResponse<Campaign>>(config.endpoints.campaigns.clubPublished(clubId), { skipAuth: true });
  }

  /**
   * Get campaign details
   */
  async getCampaignDetail(campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.get<Campaign>(config.endpoints.campaigns.detail(campaignId), { skipAuth: true });
  }

  /**
   * Apply to a campaign
   */
  async applyToCampaign(campaignId: string, applicationData: {
    application_message?: string;
    answers: ApplicationAnswer[];
  }): Promise<ApiResponse<CampaignApplication>> {
    console.log('🚀 CampaignService.applyToCampaign:', {
      campaignId,
      applicationData,
      endpoint: config.endpoints.campaigns.apply(campaignId)
    });
    
    try {
      const response = await api.post<CampaignApplication>(config.endpoints.campaigns.apply(campaignId), applicationData);
      console.log('✅ CampaignService.applyToCampaign success:', response);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get specific application details
   */
  async getApplication(campaignId: string, applicationId: string): Promise<ApiResponse<CampaignApplication>> {
    return api.get<CampaignApplication>(config.endpoints.campaigns.applicationDetail(campaignId, applicationId));
  }

  /**
   * Update application
   */
  async updateApplication(campaignId: string, applicationId: string, applicationData: {
    application_message?: string;
    answers: ApplicationAnswer[];
  }): Promise<ApiResponse<CampaignApplication>> {
    return api.put<CampaignApplication>(config.endpoints.campaigns.applicationDetail(campaignId, applicationId), applicationData);
  }

  /**
   * Withdraw/delete application
   */
  async withdrawApplication(campaignId: string, applicationId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(config.endpoints.campaigns.applicationDetail(campaignId, applicationId));
  }

  /**
   * Get user's applications with pagination
   */
  async getUserApplications(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<ApiResponse<PaginatedResponse<CampaignApplication>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const url = `${config.endpoints.campaigns.userApplications(userId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get<PaginatedResponse<CampaignApplication>>(url);
  }

  // === Club Manager Methods ===

  /**
   * Create campaign (club managers only)
   */
  async createCampaign(clubId: string, campaignData: {
    title: string;
    description: string;
    requirements?: string[];
    application_questions?: ApplicationQuestion[];
    start_date: string;
    end_date: string;
    max_applications?: number;
    status?: 'draft';
  }): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.createForClub(clubId), campaignData);
  }

  /**
   * Get club's campaigns (including drafts - for club managers)
   */
  async getClubCampaigns(clubId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    const url = `${config.endpoints.campaigns.clubCampaigns(clubId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get<PaginatedResponse<Campaign>>(url);
  }

  /**
   * Get specific club campaign details
   */
  async getClubCampaignDetail(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.get<Campaign>(config.endpoints.campaigns.clubCampaignDetail(clubId, campaignId));
  }

  /**
   * Update campaign (club managers only)
   */
  async updateCampaign(clubId: string, campaignId: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return api.put<Campaign>(config.endpoints.campaigns.clubCampaignDetail(clubId, campaignId), campaignData);
  }

  /**
   * Delete campaign (club managers only)
   */
  async deleteCampaign(clubId: string, campaignId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(config.endpoints.campaigns.clubCampaignDetail(clubId, campaignId));
  }

  /**
   * Publish campaign
   */
  async publishCampaign(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.publishCampaign(clubId, campaignId));
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.pauseCampaign(clubId, campaignId));
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.resumeCampaign(clubId, campaignId));
  }

  /**
   * Complete campaign
   */
  async completeCampaign(clubId: string, campaignId: string): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.completeCampaign(clubId, campaignId));
  }

  /**
   * Get campaign applications (club managers only)
   */
  async getCampaignApplications(clubId: string, campaignId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<ApiResponse<PaginatedResponse<CampaignApplication> & { summary: CampaignStatistics }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const url = `${config.endpoints.campaigns.campaignApplications(clubId, campaignId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get<PaginatedResponse<CampaignApplication> & { summary: CampaignStatistics }>(url);
  }

  /**
   * Get application details (club managers)
   */
  async getCampaignApplicationDetail(clubId: string, campaignId: string, applicationId: string): Promise<ApiResponse<CampaignApplication>> {
    return api.get<CampaignApplication>(config.endpoints.campaigns.campaignApplicationDetail(clubId, campaignId, applicationId));
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(clubId: string, campaignId: string, applicationId: string, data: {
    status: 'approved' | 'rejected' | 'pending';
    notes?: string;
  }): Promise<ApiResponse<CampaignApplication>> {
    return api.put<CampaignApplication>(config.endpoints.campaigns.updateApplicationStatus(clubId, campaignId, applicationId), data);
  }

  /**
   * Approve application and add to club
   */
  async approveApplication(clubId: string, campaignId: string, applicationId: string, data?: {
    role?: 'member';
    notes?: string;
  }): Promise<ApiResponse<{ application: CampaignApplication; membership: any }>> {
    return api.post<{ application: CampaignApplication; membership: any }>(config.endpoints.campaigns.approveApplication(clubId, campaignId, applicationId), data);
  }

  /**
   * Reject application
   */
  async rejectApplication(clubId: string, campaignId: string, applicationId: string, data?: {
    reason?: string;
    notes?: string;
  }): Promise<ApiResponse<CampaignApplication>> {
    return api.post<CampaignApplication>(config.endpoints.campaigns.rejectApplication(clubId, campaignId, applicationId), data);
  }
}

// Export singleton instance
export const campaignService = new CampaignService();
export default campaignService;
