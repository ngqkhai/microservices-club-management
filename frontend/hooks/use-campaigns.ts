import { useState, useEffect, useCallback } from 'react';
import { campaignService, Campaign } from '@/services/campaign.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing campaign data with loading states and error handling
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPublishedCampaigns = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getPublishedCampaigns(limit);
      if (response.success) {
        setCampaigns(response.data || []);
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
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    campaigns,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadClubCampaigns = useCallback(async () => {
    if (!clubId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getClubPublishedCampaigns(clubId);
      if (response.success) {
        setCampaigns(response.data || []);
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
    loading,
    error,
    reload: loadClubCampaigns,
  };
}
