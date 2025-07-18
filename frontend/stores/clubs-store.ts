import { create } from 'zustand';
import { clubService, Club } from '@/services/club.service';

export interface ClubsCache {
  allClubs: Club[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  retryCount: number;
}

export interface ClubsFilters {
  search: string;
  category: string;
  sort: 'name' | 'name_desc' | 'category' | 'location' | 'newest' | 'oldest' | 'relevance';
}

export interface ClubsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ClubsState {
  // Cache data
  cache: ClubsCache;
  
  // Current filters and pagination
  filters: ClubsFilters;
  pagination: ClubsPagination;
  
  // Filtered and paginated results
  filteredClubs: Club[];
  displayedClubs: Club[];
  
  // Actions
  loadAllClubs: () => Promise<void>;
  clearCache: () => void;
  resetRetry: () => void;
  setFilters: (filters: Partial<ClubsFilters>) => void;
  setPage: (page: number) => void;
  applyFiltersAndPagination: () => void;
}

const CLUBS_PER_PAGE = 6;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const defaultFilters: ClubsFilters = {
  search: '',
  category: '',
  sort: 'name'
};

const defaultPagination: ClubsPagination = {
  page: 1,
  limit: CLUBS_PER_PAGE,
  total: 0,
  totalPages: 0
};

export const useClubsStore = create<ClubsState>((set, get) => ({
  // Initial state
  cache: {
    allClubs: [],
    isLoaded: false,
    isLoading: false,
    error: null,
    lastFetched: null,
    retryCount: 0
  },
  
  filters: defaultFilters,
  pagination: defaultPagination,
  filteredClubs: [],
  displayedClubs: [],

  // Load all clubs and cache them with retry logic
  loadAllClubs: async () => {
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

      // Fetch all clubs without pagination by setting a high limit
      const response = await clubService.getClubs({ 
        limit: 99, // Fetch all clubs
        page: 1 
      });

      if (response.success && response.data) {
        const allClubs = response.data.results || [];
        
        set((state) => ({
          cache: {
            allClubs,
            isLoaded: true,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            retryCount: 0 // Reset retry count on success
          }
        }));

        // Apply filters and pagination after loading
        get().applyFiltersAndPagination();
      } else {
        throw new Error(response.message || 'Failed to fetch clubs');
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
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
        allClubs: [],
        isLoaded: false,
        isLoading: false,
        error: null,
        lastFetched: null,
        retryCount: 0
      },
      filters: defaultFilters,
      pagination: defaultPagination,
      filteredClubs: [],
      displayedClubs: []
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
  },

  // Set filters and apply them
  setFilters: (newFilters: Partial<ClubsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page when filtering
    }));
    
    get().applyFiltersAndPagination();
  },

  // Set current page
  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    
    get().applyFiltersAndPagination();
  },

  // Apply current filters and pagination to cached data
  applyFiltersAndPagination: () => {
    const { cache, filters, pagination } = get();
    
    if (!cache.isLoaded || cache.allClubs.length === 0) {
      return;
    }

    let filtered = [...cache.allClubs];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(searchTerm) ||
        (club.description && club.description.toLowerCase().includes(searchTerm)) ||
        club.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All' && filters.category !== '') {
      filtered = filtered.filter(club => club.category === filters.category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'relevance':
        default:
          return 0; // Keep original order for relevance
      }
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const displayedClubs = filtered.slice(startIndex, endIndex);

    set({
      filteredClubs: filtered,
      displayedClubs,
      pagination: {
        ...pagination,
        total,
        totalPages
      }
    });
  }
}));

// Clear cache on window reload
if (typeof window !== 'undefined') {
  const handleBeforeUnload = () => {
    useClubsStore.getState().clearCache();
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
}
