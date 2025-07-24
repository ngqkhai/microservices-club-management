import { useState, useEffect, useCallback } from 'react';
import { campaignService, Campaign, CampaignApplication, PaginatedResponse } from '@/services/campaign.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing campaign data with loading states and error handling
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPublishedCampaigns = useCallback(async (params?: {
    page?: number;
    limit?: number;
    club_id?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getPublishedCampaigns(params);
      
      if (response.success && response.data) {
        // Handle the actual API response structure where campaigns are directly in response.data
        if (Array.isArray(response.data)) {
          setCampaigns(response.data);
          // Check if pagination exists at the response level (not nested in data)
          setPagination((response as any).pagination || null);
        } else {
          // Fallback for expected structure
          setCampaigns(response.data.data || []);
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.message || 'Failed to load campaigns');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load campaigns';
      setError(errorMessage);
      
      // Show toast only for non-404 errors
      if (err.status !== 404) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // Set empty array for graceful degradation
      setCampaigns([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    campaigns,
    pagination,
    loading,
    error,
    loadPublishedCampaigns,
    setCampaigns,
  };
}

/**
 * Hook for managing club-specific campaigns
 */
export function useClubCampaigns(clubId: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadClubCampaigns = useCallback(async () => {
    if (!clubId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getClubPublishedCampaigns(clubId);
      if (response.success && response.data) {
        // Handle the actual API response structure where campaigns are directly in response.data
        if (Array.isArray(response.data)) {
          setCampaigns(response.data);
          // Check if pagination exists at the response level (not nested in data)
          setPagination((response as any).pagination || null);
        } else {
          // Fallback for expected structure
          setCampaigns(response.data.data || []);
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.message || 'Failed to load club campaigns');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load club campaigns';
      setError(errorMessage);
      
      // Only show toast for server errors, not for missing data
      if (err.status >= 500) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // Set empty array for graceful degradation
      setCampaigns([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [clubId, toast]);

  // Auto-load when clubId changes
  useEffect(() => {
    loadClubCampaigns();
  }, [loadClubCampaigns]);

  return {
    campaigns,
    pagination,
    loading,
    error,
    reload: loadClubCampaigns,
  };
}

/**
 * Hook for managing user applications
 */
export function useUserApplications(userId: string) {
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadApplications = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getUserApplications(userId, params);
      if (response.success && response.data) {
        setApplications(response.data.data || []);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to load applications');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load applications';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setApplications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const applyToCampaign = useCallback(async (
    campaignId: string,
    applicationData: {
      application_message?: string;
      application_answers: Record<string, string>;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.applyToCampaign(campaignId, applicationData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application submitted successfully',
        });
        // Reload applications to show the new one
        await loadApplications();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit application';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, toast]);

  const updateApplication = useCallback(async (
    campaignId: string,
    applicationId: string,
    applicationData: {
      application_message?: string;
      application_answers: Record<string, string>;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.updateApplication(campaignId, applicationId, applicationData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application updated successfully',
        });
        // Reload applications to show the updated one
        await loadApplications();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update application');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update application';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, toast]);

  const withdrawApplication = useCallback(async (campaignId: string, applicationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.withdrawApplication(campaignId, applicationId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application withdrawn successfully',
        });
        // Reload applications to remove the withdrawn one
        await loadApplications();
      } else {
        throw new Error(response.message || 'Failed to withdraw application');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to withdraw application';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, toast]);

  return {
    applications,
    pagination,
    loading,
    error,
    loadApplications,
    applyToCampaign,
    updateApplication,
    withdrawApplication,
  };
}
