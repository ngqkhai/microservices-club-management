# Campaign Creation Implementation Guide

## Overview

This document describes the implementation of the campaign creation functionality that follows the `POST /api/clubs/{clubId}/campaigns` endpoint from the RECRUITMENT_API_DOCUMENTATION.

## Implementation Details

### 1. API Service Layer (`services/campaign.service.ts`)

The `campaignService.createCampaign()` method handles the API call:

```typescript
async createCampaign(clubId: string, campaignData: {
  title: string;
  description: string;
  requirements?: string[];
  application_questions?: ApplicationQuestion[];
  start_date: string;
  end_date: string;
  max_applications?: number;
  status?: 'draft';
}): Promise<ApiResponse<Campaign>>
```

### 2. Page Component (`app/clubs/[club_id]/manage/campaigns/new/page.tsx`)

The main page component handles:
- Form submission with `handleSave()`
- Data transformation from form format to API format
- Loading states and error handling
- Success navigation

### 3. Form Component (`components/club-manager/campaign-form.tsx`)

The reusable form component:
- Collects campaign data including requirements array and application questions
- Validates form data before submission
- Supports external loading states
- Provides user feedback

## Data Flow

1. **User Input**: User fills out the campaign form
2. **Validation**: Client-side validation ensures required fields and data integrity
3. **Transformation**: Form data is transformed to match API expectations:
   - `is_required` → `required`
   - `multiple-choice` → `select` type
   - Date strings → ISO format
4. **API Call**: `campaignService.createCampaign()` sends POST request
5. **Response Handling**: Success/error handling with user feedback
6. **Navigation**: Redirect to campaign management on success

## API Request Format

```typescript
// Form Data (Frontend)
{
  title: "Fall 2025 Recruitment",
  description: "Join our tech club...",
  requirements: ["Basic programming knowledge", "Commitment to attend meetings"],
  application_questions: [
    {
      id: "1",
      question: "What programming languages do you know?",
      type: "text",
      is_required: true
    }
  ],
  start_date: "2025-09-01",
  end_date: "2025-09-15",
  max_applications: 50
}

// API Request (Transformed)
{
  title: "Fall 2025 Recruitment",
  description: "Join our tech club...",
  requirements: ["Basic programming knowledge", "Commitment to attend meetings"],
  application_questions: [
    {
      id: "1",
      question: "What programming languages do you know?",
      type: "text",
      required: true
    }
  ],
  start_date: "2025-09-01T00:00:00Z",
  end_date: "2025-09-15T00:00:00Z",
  max_applications: 50,
  status: "draft"
}
```

## Error Handling

The implementation handles various error scenarios:

1. **Validation Errors**: Client-side validation with toast notifications
2. **API Validation Errors**: Server validation errors displayed to user
3. **Network Errors**: Generic error handling for connection issues
4. **Permission Errors**: 403 errors for insufficient permissions

## Testing

To test the implementation:

1. **Manual Testing**:
   - Navigate to `/clubs/{clubId}/manage/campaigns/new`
   - Fill out the form with valid data
   - Click "Tạo chiến dịch" button
   - Verify API call in browser developer tools
   - Check success navigation and toast

2. **Error Testing**:
   - Test with invalid dates (end date before start date)
   - Test with empty required fields
   - Test with network issues (disconnect internet)

## Security Considerations

- JWT authentication required for all campaign creation endpoints
- Club manager role required (enforced at API level)
- Input validation and sanitization
- XSS protection through React's built-in sanitization

## Performance Considerations

- Loading states prevent multiple submissions
- Form validation reduces unnecessary API calls
- Optimistic UI updates for better user experience
- Error boundaries for graceful error handling

## Future Enhancements

1. **Draft Auto-save**: Automatically save form data as draft
2. **Rich Text Editor**: Enhanced description editing
3. **File Upload**: Support for campaign attachments
4. **Preview Mode**: Preview campaign before publishing
5. **Bulk Operations**: Import/export campaign templates
