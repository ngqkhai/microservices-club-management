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

  // Load clubs theo page/limit/filter/sort từ server
  loadAllClubs: async () => {
    const state = get();
    const { filters, pagination, cache } = state;

    // Nếu đang loading thì return
    if (cache.isLoading) {
      return;
    }

    // Check nếu quá số lần retry
    if (cache.retryCount >= MAX_RETRY_ATTEMPTS) {
      set((state) => ({
        cache: {
          ...state.cache,
          error: `Đã thử ${MAX_RETRY_ATTEMPTS} lần nhưng không thể tải dữ liệu. Vui lòng thử lại sau.`
        }
      }));
      return;
    }

    // Set loading và tăng retry
    set((state) => ({
      cache: {
        ...state.cache,
        isLoading: true,
        error: null,
        retryCount: state.cache.retryCount + 1
      }
    }));

    try {
      // Thêm delay nếu retry
      if (cache.retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * cache.retryCount));
      }

      // Gọi API lấy clubs theo page/limit/filter/sort
      const response = await clubService.getClubs({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        sort: filters.sort || undefined
      });

      if (response.success && response.data) {
        const clubs = response.data.results || [];
        const total = response.data.total || clubs.length;
        const totalPages = Math.ceil(total / pagination.limit);

        set((state) => ({
          cache: {
            ...state.cache,
            allClubs: clubs, // Lưu clubs trang hiện tại
            isLoaded: true,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            retryCount: 0
          },
          filteredClubs: clubs, // Không filter phía client nữa
          displayedClubs: clubs,
          pagination: {
            ...state.pagination,
            total,
            totalPages
          }
        }));
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

  // Clear cache (reset lại state)
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

  // Reset retry count
  resetRetry: () => {
    set((state) => ({
      cache: {
        ...state.cache,
        retryCount: 0,
        error: null
      }
    }));
  },

  // Set filters và fetch lại clubs từ server
  setFilters: (newFilters: Partial<ClubsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().loadAllClubs();
  },

  // Set page và fetch lại clubs từ server
  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().loadAllClubs();
  },

  // Không cần filter/paginate phía client nữa
  applyFiltersAndPagination: () => {},
}));
