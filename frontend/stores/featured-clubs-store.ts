import { create } from 'zustand';
import { clubService, Club } from '@/services/club.service';

// Club interface for components (backward compatibility)
export interface ClubForComponent {
  club_id: string;
  name: string;
  description: string;
  logo_url: string;
  members: number;
  category: string;
}

export interface FeaturedClubsCache {
  featuredClubs: ClubForComponent[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  retryCount: number;
}

interface FeaturedClubsState {
  // Cache data
  cache: FeaturedClubsCache;
  
  // Actions
  loadFeaturedClubs: () => Promise<void>;
  clearCache: () => void;
  resetRetry: () => void;
}

const FEATURED_CLUBS_COUNT = 6;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Helper function to adapt API Club to component Club
const adaptClubForComponent = (apiClub: Club): ClubForComponent => ({
  club_id: apiClub.id,
  name: apiClub.name,
  description: apiClub.description || '',
  logo_url: apiClub.logo_url || '',
  members: apiClub.member_count,
  category: apiClub.category
});

export const useFeaturedClubsStore = create<FeaturedClubsState>((set, get) => ({
  // Initial state
  cache: {
    featuredClubs: [],
    isLoaded: false,
    isLoading: false,
    error: null,
    lastFetched: null,
    retryCount: 0
  },

  // Load featured clubs with retry logic
  loadFeaturedClubs: async () => {
    const state = get();
    
    // If already loading, return
    if (state.cache.isLoading) {
      return;
    }

    // Check if max retries exceeded
    if (state.cache.retryCount >= MAX_RETRY_ATTEMPTS) {
      set((state) => ({
        cache: {
          ...state.cache,
          error: `Đã thử ${MAX_RETRY_ATTEMPTS} lần nhưng không thể tải dữ liệu. Vui lòng thử lại sau.`
        }
      }));
      return;
    }

    // Set loading state and increment retry count
    set((state) => ({
      cache: {
        ...state.cache,
        isLoading: true,
        error: null,
        retryCount: state.cache.retryCount + 1
      }
    }));

    try {
      // Add delay for retries (except first attempt)
      if (state.cache.retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * state.cache.retryCount));
      }

      // Fetch clubs and get the first 6 for featured clubs
      // You can modify this logic to fetch clubs by popularity, member count, or other criteria
      const response = await clubService.getClubs({ 
        limit: FEATURED_CLUBS_COUNT,
        page: 1 
      });

      if (response.success && response.data) {
        const apiClubs = response.data.results || [];
        const featuredClubs = apiClubs.map(adaptClubForComponent);
        
        set((state) => ({
          cache: {
            featuredClubs,
            isLoaded: true,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            retryCount: 0 // Reset retry count on success
          }
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch featured clubs');
      }
    } catch (error) {
      console.error('Error loading featured clubs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      set((state) => ({
        cache: {
          ...state.cache,
          isLoading: false,
          error: errorMessage
        }
      }));
    }
  },

  // Clear cache (called on page reload)
  clearCache: () => {
    set({
      cache: {
        featuredClubs: [],
        isLoaded: false,
        isLoading: false,
        error: null,
        lastFetched: null,
        retryCount: 0
      }
    });
  },

  // Reset retry count to allow retrying
  resetRetry: () => {
    set((state) => ({
      cache: {
        ...state.cache,
        retryCount: 0,
        error: null
      }
    }));
  }
}));
