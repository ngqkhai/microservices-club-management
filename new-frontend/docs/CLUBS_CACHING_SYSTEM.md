# Clubs Caching System Documentation

## Overview
This document explains the caching system implemented for the clubs page that automatically fetches and caches all clubs data when accessing the `/clubs` route, then performs client-side filtering and pagination.

## Architecture

### Clubs Store (`stores/clubs-store.ts`)
A Zustand store that manages:
- **Cache**: Stores all clubs data fetched from the API
- **Filters**: Current search and category filters
- **Pagination**: Current page and pagination information
- **Display Data**: Filtered and paginated clubs for display

### Key Features

#### 1. Automatic Data Loading
- When accessing `/clubs` route, the store automatically calls `loadAllClubs()`
- Fetches all clubs from API with a high limit (1000) to get complete dataset
- Caches the data in memory for fast access

#### 2. Client-side Filtering
- **Search**: Filters by club name, description, category, and location
- **Category**: Filters by specific club category
- **Sorting**: Supports multiple sort options (name, category, newest, oldest, etc.)

#### 3. Client-side Pagination
- 6 clubs per page as specified
- Pagination works on filtered results
- Fast navigation between pages (no API calls)

#### 4. Cache Management
- Cache is cleared on page reload (`beforeunload` event)
- Cache includes loading states and error handling
- Prevents duplicate API calls when already loading
- **Retry Logic**: Maximum 3 retry attempts with exponential backoff
- **Rate Limiting**: Delays between retries to avoid server overload

## Implementation Details

### Club Interface
Based on API documentation, clubs have the following structure:
```typescript
interface Club {
  id: string;
  name: string;
  description?: string;
  category: 'academic' | 'sports' | 'arts' | 'technology' | 'social' | 'volunteer' | 'cultural' | 'other';
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  website_url?: string;
  social_links?: object;
  settings?: object;
  status: string;
  member_count: number;
  created_by?: string;
  manager?: object;
  created_at: Date;
}
```

### API Integration
- **Endpoint**: `GET /api/clubs`
- **Base URL**: `http://localhost:3002` (configurable via environment)
- **Authentication**: Public endpoint with `skipAuth: true`
- **Response Format**: Based on Club Service API documentation

### Filter System
```typescript
interface ClubsFilters {
  search: string;        // Search across name, description, category
  category: string;      // Filter by specific category
  sort: SortOption;      // Sort criteria
}
```

### Pagination System
```typescript
interface ClubsPagination {
  page: number;          // Current page (1-based)
  limit: number;         // Items per page (6)
  total: number;         // Total filtered items
  totalPages: number;    // Total pages
}
```

## Usage

### In React Components
```tsx
import { useClubsStore } from '@/stores/clubs-store';

function ClubsPage() {
  const {
    cache,              // Cache state (isLoading, isLoaded, error, allClubs)
    filters,            // Current filters
    pagination,         // Pagination info
    displayedClubs,     // Current page clubs
    loadAllClubs,       // Load data function
    setFilters,         // Update filters
    setPage             // Change page
  } = useClubsStore();

  // Load data on mount
  useEffect(() => {
    if (!cache.isLoaded && !cache.isLoading) {
      loadAllClubs();
    }
  }, [cache.isLoaded, cache.isLoading, loadAllClubs]);

  // Update filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchInput, category: categoryInput });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput, categoryInput, setFilters]);
}
```

### States and Behavior

#### Loading State
- `cache.isLoading`: true during API call
- Shows skeleton loading cards
- Prevents duplicate API calls

#### Loaded State
- `cache.isLoaded`: true when data is cached
- `displayedClubs`: contains current page items
- All filtering/pagination happens on cached data

#### Error State
- `cache.error`: contains error message if API fails
- Shows error message with retry button
- Retry button calls `loadAllClubs()` again

#### Empty State
- Shows when no clubs match current filters
- Suggests adjusting search/filter criteria

## Performance Benefits

1. **Single API Call**: Only one API call per session
2. **Instant Filtering**: No network delay for search/filter
3. **Fast Pagination**: Immediate page switching
4. **Debounced Search**: 300ms delay prevents excessive filtering
5. **Memory Efficiency**: Cache cleared on page reload

## Error Handling

1. **Network Errors**: Caught and displayed to user
2. **API Errors**: Error messages from server shown
3. **Retry Mechanism**: 
   - Maximum 3 retry attempts per session
   - Exponential backoff delay (1s, 2s, 3s)
   - Retry counter displayed to user
   - Users can manually reset retry count
4. **Fallback States**: Proper loading and empty states
5. **Rate Limiting**: Prevents excessive API calls during failures

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Constants
```typescript
const CLUBS_PER_PAGE = 6;        // Can be adjusted if needed
const MAX_RETRY_ATTEMPTS = 3;    // Maximum retry attempts
const RETRY_DELAY_MS = 1000;     // Base delay for retries (multiplied by attempt number)
```

## Future Enhancements

1. **Cache Expiration**: Add time-based cache invalidation
2. **Background Refresh**: Periodically update cache
3. **Advanced Filters**: Location-based filtering
4. **Search Highlighting**: Highlight search terms in results
5. **Virtual Scrolling**: For better performance with large datasets

## Testing Scenarios

1. **Fresh Load**: First visit should trigger API call
2. **Filter/Search**: Should work instantly on cached data
3. **Pagination**: Should navigate quickly between pages
4. **Page Reload**: Should clear cache and reload data
5. **Network Error**: Should show error with retry option
6. **Empty Results**: Should show appropriate message
7. **Retry Logic**: 
   - Test failed API calls trigger retry
   - Verify exponential backoff delays
   - Check retry counter display
   - Ensure max retry limit is enforced
8. **Rate Limiting**: Verify delays prevent server overload

## Dependencies

- `zustand`: State management
- `@/services/club.service`: API integration
- `@/lib/api`: HTTP client
- React hooks for UI integration
