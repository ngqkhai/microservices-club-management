# Featured Clubs Caching System Documentation

## Overview
This document explains the caching system implemented for the featured clubs section on the homepage (`/`) that automatically fetches and caches the top 6 clubs data, providing error handling and retry logic similar to the main clubs page.

## Architecture

### Featured Clubs Store (`stores/featured-clubs-store.ts`)
A dedicated Zustand store that manages:
- **Cache**: Stores the top 6 featured clubs data fetched from the API
- **Error Handling**: Manages loading states, error states, and retry logic
- **Data Adaptation**: Converts API Club format to component-compatible format

### Key Features

#### 1. Automatic Data Loading
- When accessing the homepage (`/`), the store automatically calls `loadFeaturedClubs()`
- Fetches the first 6 clubs from the API (limit: 6, page: 1)
- Caches the data in memory for fast access
- Can be extended to fetch clubs by popularity, member count, or other criteria

#### 2. Error Handling & Retry Logic
- **Maximum 3 retry attempts** with exponential backoff
- **Rate Limiting**: Delays between retries (1s, 2s, 3s) to avoid server overload
- **User-friendly error messages** in Vietnamese
- **Manual retry option** for users when max retries exceeded

#### 3. Data Adaptation
- Converts API Club format (`id`, `member_count`) to component format (`club_id`, `members`)
- Ensures backward compatibility with existing `ClubPreviewCard` component
- Handles optional fields with default values

#### 4. Cache Management
- Cache is cleared on page reload (`beforeunload` event)
- Prevents duplicate API calls when already loading
- Includes comprehensive loading and error states

## Implementation Details

### Club Interfaces

#### API Club Interface (from `club.service.ts`)
```typescript
interface Club {
  id: string;
  name: string;
  description?: string;
  category: 'academic' | 'sports' | 'arts' | 'technology' | 'social' | 'volunteer' | 'cultural' | 'other';
  location?: string;
  logo_url?: string;
  member_count: number;
  created_at: Date;
  // ... other fields
}
```

#### Component Club Interface (adapted for ClubPreviewCard)
```typescript
interface ClubForComponent {
  club_id: string;
  name: string;
  description: string;
  logo_url: string;
  members: number;
  category: string;
}
```

### API Integration
- **Endpoint**: `GET /api/clubs?limit=6&page=1`
- **Base URL**: `http://localhost:3002` (configurable via environment)
- **Authentication**: Public endpoint with `skipAuth: true`
- **Response Format**: Based on Club Service API documentation

### Error Handling States
```typescript
interface FeaturedClubsCache {
  featuredClubs: ClubForComponent[];
  isLoaded: boolean;        // true when data successfully loaded
  isLoading: boolean;       // true during API call
  error: string | null;     // error message if failed
  lastFetched: number | null; // timestamp of last successful fetch
  retryCount: number;       // current retry attempt (0-3)
}
```

## Usage

### In React Components (Homepage)
```tsx
import { useFeaturedClubsStore } from '@/stores/featured-clubs-store';

function HomePage() {
  const { cache, loadFeaturedClubs, resetRetry } = useFeaturedClubsStore();

  // Load data on component mount
  useEffect(() => {
    if (!cache.isLoaded && !cache.isLoading) {
      loadFeaturedClubs();
    }
  }, [cache.isLoaded, cache.isLoading, loadFeaturedClubs]);

  // Render based on cache state
  if (cache.isLoading) {
    return <LoadingSkeletons />;
  }
  
  if (cache.error) {
    return (
      <ErrorState 
        error={cache.error}
        retryCount={cache.retryCount}
        onRetry={() => {
          resetRetry();
          loadFeaturedClubs();
        }}
      />
    );
  }
  
  if (cache.featuredClubs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cache.featuredClubs.map((club) => (
        <ClubPreviewCard key={club.club_id} club={club} />
      ))}
    </div>
  );
}
```

### States and Behavior

#### Loading State
- `cache.isLoading`: true during API call
- Shows 6 skeleton loading cards in 3-column grid
- Prevents duplicate API calls

#### Loaded State
- `cache.isLoaded`: true when data is cached
- `cache.featuredClubs`: contains up to 6 featured clubs
- Data is adapted for component compatibility

#### Error State
- `cache.error`: contains error message if API fails
- Shows error message with retry button and retry count
- Provides alternative action to view all clubs

#### Empty State
- Shows when API returns no clubs
- Provides link to explore all clubs

## Performance Benefits

1. **Single API Call**: Only one API call per homepage visit
2. **Optimized Data**: Fetches only 6 clubs instead of all clubs
3. **Memory Efficiency**: Cache cleared on page reload
4. **Error Recovery**: Automatic retry with exponential backoff
5. **User Experience**: Loading skeletons and meaningful error messages

## Error Handling Strategy

1. **Network Errors**: Caught and displayed with Vietnamese messages
2. **API Errors**: Server error messages displayed to user
3. **Retry Mechanism**: 
   - Maximum 3 attempts per session
   - Exponential backoff (1s, 2s, 3s delays)
   - Visual retry counter for transparency
   - Manual retry option after max attempts reached
4. **Fallback Actions**: Link to full clubs page when errors occur
5. **Rate Limiting**: Prevents server overload during retry attempts

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Constants
```typescript
const FEATURED_CLUBS_COUNT = 6;     // Number of featured clubs to fetch
const MAX_RETRY_ATTEMPTS = 3;       // Maximum retry attempts
const RETRY_DELAY_MS = 1000;        // Base delay for retries (multiplied by attempt number)
```

## Future Enhancements

1. **Smart Selection**: Fetch clubs by popularity, recent activity, or member count
2. **Cache Expiration**: Add time-based cache invalidation (e.g., 1 hour)
3. **Background Refresh**: Periodically update cache in background
4. **Analytics Integration**: Track which featured clubs get the most views
5. **A/B Testing**: Test different featured club selection algorithms
6. **Personalization**: Show featured clubs based on user interests/past activity

## Testing Scenarios

1. **Fresh Load**: First homepage visit should trigger API call
2. **Cached Load**: Subsequent visits should use cached data
3. **Page Reload**: Should clear cache and reload data
4. **Network Error**: Should show error with retry option
5. **Empty Response**: Should show appropriate empty state
6. **Retry Logic**: 
   - Test failed API calls trigger retry with increasing delays
   - Verify retry counter display and functionality
   - Ensure max retry limit is enforced
   - Test manual retry after max attempts
7. **Component Integration**: Verify ClubPreviewCard receives correctly formatted data

## Integration with Main Clubs Cache

The featured clubs cache is separate from the main clubs cache (`clubs-store.ts`) to:
- **Optimize Performance**: Fetch only needed data for homepage
- **Independent Management**: Different cache lifetimes and strategies
- **Reduced Complexity**: Simpler state management for homepage
- **Future Flexibility**: Allow different fetching criteria for featured vs all clubs

## Dependencies

- `zustand`: State management
- `@/services/club.service`: API integration  
- `@/lib/api`: HTTP client
- `@/components/club-preview-card`: Display component
- React hooks for UI integration
