import api, { ApiResponse } from '@/lib/api';
import config from '@/config';

/**
 * Campaign interfaces
 */
export interface Campaign {
  id: string;
  title: string;
  description: string;
  club_id: string;
  club_name?: string;
  requirements: string[];
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  total_applications: number;
  max_applications?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  answers: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

/**
 * Campaign service class
 */
class CampaignService {
  /**
   * Get all published campaigns
   */
  async getPublishedCampaigns(limit?: number): Promise<ApiResponse<Campaign[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<Campaign[]>(`${config.endpoints.campaigns.published}${params}`, { skipAuth: true });
  }

  /**
   * Get published campaigns for a specific club
   */
  async getClubPublishedCampaigns(clubId: string): Promise<ApiResponse<Campaign[]>> {
    return api.get<Campaign[]>(config.endpoints.campaigns.clubPublished(clubId), { skipAuth: true });
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
  async applyToCampaign(campaignId: string, answers: Record<string, any>): Promise<ApiResponse<CampaignApplication>> {
    return api.post<CampaignApplication>(config.endpoints.campaigns.apply(campaignId), { answers });
  }

  /**
   * Get user's applications
   */
  async getUserApplications(): Promise<ApiResponse<CampaignApplication[]>> {
    return api.get<CampaignApplication[]>(config.endpoints.campaigns.myApplications);
  }

  /**
   * Create campaign (club managers only)
   */
  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return api.post<Campaign>(config.endpoints.campaigns.create, campaignData);
  }

  /**
   * Update campaign (club managers only)
   */
  async updateCampaign(campaignId: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return api.put<Campaign>(config.endpoints.campaigns.update(campaignId), campaignData);
  }

  /**
   * Get campaign applications (club managers only)
   */
  async getCampaignApplications(campaignId: string): Promise<ApiResponse<CampaignApplication[]>> {
    return api.get<CampaignApplication[]>(config.endpoints.campaigns.applications(campaignId));
  }
}

// Export singleton instance
export const campaignService = new CampaignService();
export default campaignService;
