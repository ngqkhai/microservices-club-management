# Recruitment System Frontend Integration

This document explains how the recruitment campaign frontend has been integrated with the backend API according to the provided API documentation.

## Overview

The frontend now includes comprehensive support for:
- Browsing published recruitment campaigns
- Applying to campaigns with dynamic forms
- Managing user applications
- Club manager functionality for reviewing applications
- Campaign status management

## Updated Files and Components

### 1. Core Services

#### `services/campaign.service.ts`
- **Updated interfaces** to match API documentation exactly
- **Enhanced Campaign interface** with proper statistics, application questions, etc.
- **Comprehensive API methods** for all documented endpoints:
  - Public endpoints (published campaigns, campaign details)
  - User application management (apply, update, withdraw)
  - Club manager endpoints (create/manage campaigns, review applications)

#### `config/index.ts`
- **Added all missing endpoints** from the API documentation
- **Organized endpoints** by functionality (public, user, club manager)
- **Includes simplified routes** for backward compatibility

### 2. React Hooks

#### `hooks/use-campaigns.ts`
- **Enhanced pagination support** for all campaign and application lists
- **Added useUserApplications hook** for managing user's own applications
- **Integrated proper error handling** and loading states
- **Added application management functions** (apply, update, withdraw)

### 3. UI Components

#### `components/application-form.tsx`
- **Complete rewrite** to work with backend API
- **Dynamic question rendering** based on campaign's application_questions
- **Support for all question types**: text, textarea, select, checkbox
- **Proper validation** with character limits and required fields
- **Campaign information display** with deadlines and requirements
- **Edit mode support** for updating existing applications

#### `components/recruitment-card.tsx`
- **Updated to use Campaign interface** from API
- **Enhanced status display** (published, paused, completed, expired)
- **Application progress indicators** when max_applications is set
- **Better date formatting** and deadline warnings
- **Responsive design** improvements

#### `components/recruitment-banner.tsx`
- **Fixed interface compatibility** with Campaign type
- **Added campaign status checking** for apply buttons
- **Improved countdown display** with proper Vietnamese formatting
- **Better error handling** and loading states

#### `components/user-applications.tsx` (New)
- **Complete application management** for users
- **Tabbed interface** (All, Pending, Approved, Rejected)
- **Application cards** with status indicators
- **Actions**: view details, edit (pending only), withdraw (pending only)
- **Detailed application view** dialog
- **Integrated with useUserApplications hook**

#### `components/campaign-application-review.tsx` (New)
- **Club manager interface** for reviewing applications
- **Statistics dashboard** showing application counts by status
- **Tabbed application lists** with filtering
- **Application review dialogs** for approve/reject actions
- **Bulk application management** capabilities
- **Member role assignment** when approving applications

### 4. Pages

#### `app/recruitment/page.tsx` (New)
- **Demo page** showing complete recruitment workflow
- **Browse campaigns** with banner and grid views
- **My applications** tab for authenticated users
- **Application form integration** with success handling
- **Authentication-aware** functionality

## API Integration Details

### Authentication
- All protected endpoints use JWT tokens from the auth store
- Headers are automatically injected by the API gateway
- Proper error handling for authentication failures

### Data Flow
1. **Campaign Browsing**: Uses public endpoints, no auth required
2. **Application Submission**: Requires authentication, validates against campaign questions
3. **Application Management**: Users can view, edit (pending), and withdraw their applications
4. **Club Manager Review**: Full CRUD operations on applications with status management

### Error Handling
- Comprehensive error messages from API responses
- Toast notifications for user feedback
- Graceful degradation when services are unavailable
- Loading states and skeleton components

### Pagination
- All list endpoints support pagination
- Frontend automatically handles pagination parameters
- Infinite scroll can be easily implemented with existing hooks

## Integration Steps

### 1. Install Required Dependencies
The following UI components are used and should be available:
- `@/components/ui/*` (shadcn/ui components)
- `@/hooks/use-toast` for notifications
- Zustand for state management (auth store)

### 2. Backend API Setup
Ensure your backend implements all endpoints from `RECRUITMENT_API_DOCUMENTATION.md`:
- Public campaign endpoints (`/api/campaigns/published`)
- User application endpoints (`/api/campaigns/{id}/apply`)
- Club manager endpoints (`/api/clubs/{id}/campaigns`)

### 3. Environment Configuration
Update your environment variables:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_JWT_STORAGE_KEY=club_management_token
```

### 4. Route Integration
Add recruitment routes to your Next.js app:
```bash
app/
  recruitment/
    page.tsx                 # Main recruitment page
  campaigns/
    [id]/
      page.tsx              # Individual campaign details
  profile/
    applications/
      page.tsx              # User applications page
```

### 5. Club Manager Integration
For club spaces, integrate the campaign management:
```tsx
import { CampaignApplicationReview } from '@/components/campaign-application-review'

// In club manager dashboard
<CampaignApplicationReview clubId={clubId} campaign={campaign} />
```

## Usage Examples

### Basic Campaign List
```tsx
import { useCampaigns } from '@/hooks/use-campaigns'
import { RecruitmentCard } from '@/components/recruitment-card'

function CampaignsList() {
  const { campaigns, loading, loadPublishedCampaigns } = useCampaigns()
  
  useEffect(() => {
    loadPublishedCampaigns({ limit: 10 })
  }, [])

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <RecruitmentCard
          key={campaign.id}
          campaign={campaign}
          onApply={(campaign) => {/* handle apply */}}
        />
      ))}
    </div>
  )
}
```

### Application Form Usage
```tsx
import { ApplicationForm } from '@/components/application-form'

function ApplyToCampaign({ campaign }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button onClick={() => setShowForm(true)}>
        Apply to {campaign.title}
      </button>
      {showForm && (
        <ApplicationForm
          campaign={campaign}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            // Handle success (e.g., show success message, redirect)
          }}
        />
      )}
    </>
  )
}
```

### User Applications Management
```tsx
import { UserApplications } from '@/components/user-applications'

function MyApplicationsPage() {
  return (
    <div className="container mx-auto p-6">
      <UserApplications />
    </div>
  )
}
```

## Testing

### Mock Data
For testing without backend, you can use mock data:
```tsx
const mockCampaign: Campaign = {
  id: "1",
  club_id: "club1",
  club_name: "Tech Club",
  title: "Fall 2025 Recruitment",
  description: "Join our tech club...",
  requirements: ["Basic programming knowledge"],
  application_questions: [
    {
      id: "q1",
      question: "Why do you want to join?",
      type: "textarea",
      required: true,
      max_length: 500
    }
  ],
  start_date: "2025-09-01T00:00:00Z",
  end_date: "2025-09-15T23:59:59Z",
  status: "published",
  statistics: {
    total_applications: 10,
    approved_applications: 3,
    rejected_applications: 1,
    pending_applications: 6,
    last_updated: "2025-07-18T10:30:00Z"
  },
  created_at: "2025-07-15T08:00:00Z",
  updated_at: "2025-07-18T10:30:00Z"
}
```

### API Testing
Test the integration with tools like:
- Postman for API endpoint testing
- React Testing Library for component testing
- Cypress for end-to-end testing

## Security Considerations

- All user inputs are properly validated
- JWT tokens are securely stored and transmitted
- File uploads (if implemented) should be validated on backend
- Rate limiting should be implemented for application endpoints
- CORS policies should be properly configured

## Performance Optimizations

- Campaigns are paginated to avoid large data transfers
- Images are lazy-loaded where applicable
- Debounced search functionality can be added
- Caching strategies for frequently accessed campaigns
- Optimistic updates for better user experience

## Future Enhancements

- File upload support for application questions
- Real-time notifications for application status updates
- Advanced filtering and search capabilities
- Bulk application management for club managers
- Application analytics and reporting
- Email integration for notifications
- Mobile app support with shared components

This integration provides a complete, production-ready recruitment system that closely follows the API documentation and provides excellent user experience for both applicants and club managers.
