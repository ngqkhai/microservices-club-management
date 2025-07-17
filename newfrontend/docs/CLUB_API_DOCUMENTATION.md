# Club Service API Documentation

## Overview
The Club Service provides endpoints for managing clubs and recruitment campaigns within the club management system. This documentation is designed to help frontend developers integrate with the club service APIs.

**Base URL:** `http://localhost:3002/api` (local development)

## Authentication
All endpoints require API Gateway authentication via the `X-API-Gateway-Secret` header for public endpoints or full authentication headers for private endpoints.

### Headers
- **Public Endpoints:** `X-API-Gateway-Secret: <secret>`
- **Private Endpoints:** 
  - `X-API-Gateway-Secret: <secret>`
  - `Authorization: Bearer <token>`
  - Additional user context headers from API Gateway

## Data Models

### Club Model
\`\`\`typescript
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
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  settings?: {
    is_public: boolean;
    requires_approval: boolean;
    max_members?: number;
  };
  status: string;
  member_count: number;
  created_by?: string;
  manager?: {
    user_id: string;
    full_name: string;
    email?: string;
  };
  created_at: Date;
  // Backward compatibility
  type?: string;
  size?: number;
}
\`\`\`

### Recruitment Campaign Model
\`\`\`typescript
interface RecruitmentCampaign {
  id: string;
  club_id: string;
  title: string;
  description?: string;
  requirements?: string[];
  application_questions?: Array<{
    question: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
  }>;
  start_date: Date;
  end_date: Date;
  max_applications?: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  statistics: {
    total_applications: number;
    approved_applications: number;
    rejected_applications: number;
    pending_applications: number;
    last_updated: Date;
  };
  created_at: Date;
  updated_at: Date;
}
\`\`\`

### Pagination Response
\`\`\`typescript
interface PaginationResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  results: T[];
}
\`\`\`

## Club Endpoints

### 1. Get All Clubs (Public)
**GET** `/clubs`

Retrieve clubs with advanced filtering and search capabilities.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Search across name, description, category, location | - |
| `name` | string | Filter by club name (partial match) | - |
| `category` | string | Filter by category (exact match) | - |
| `location` | string | Filter by location (partial match) | - |
| `sort` | string | Sort by: `name`, `name_desc`, `category`, `location`, `newest`, `oldest`, `relevance` | `name` |
| `page` | number | Page number (min: 1) | 1 |
| `limit` | number | Items per page (min: 1, max: 100) | 10 |

#### Response
\`\`\`json
{
  "success": true,
  "message": "Clubs retrieved successfully",
  "data": {
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "limit": 10,
    "results": [
      {
        "id": "club_id_1",
        "name": "Tech Club",
        "description": "A club for technology enthusiasts",
        "category": "technology",
        "location": "Building A, Room 101",
        "logo_url": "https://example.com/logo.png",
        "status": "ACTIVE",
        "member_count": 25,
        "settings": {
          "is_public": true,
          "requires_approval": false
        }
      }
    ]
  },
  "meta": {
    "searchParams": {
      "page": 1,
      "limit": 10,
      "sort": "name"
    },
    "timestamp": "2025-07-16T10:00:00.000Z"
  }
}
\`\`\`

### 2. Get Club by ID (Public)
**GET** `/clubs/:id`

#### Response
\`\`\`json
{
  "id": "club_id_1",
  "name": "Tech Club",
  "description": "A club for technology enthusiasts",
  "category": "technology",
  "location": "Building A, Room 101",
  "contact_email": "techclub@university.edu",
  "contact_phone": "+1-555-0123",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://techclub.university.edu",
  "social_links": {
    "facebook": "https://facebook.com/techclub",
    "instagram": "https://instagram.com/techclub"
  },
  "settings": {
    "is_public": true,
    "requires_approval": false,
    "max_members": 100
  },
  "status": "ACTIVE",
  "member_count": 25,
  "created_by": "user_id_1"
}
\`\`\`

### 3. Get Club Categories (Public)
**GET** `/clubs/categories`

#### Response
\`\`\`json
["academic", "arts", "cultural", "social", "sports", "technology", "volunteer"]
\`\`\`

### 4. Get Club Locations (Public)
**GET** `/clubs/locations`

#### Response
\`\`\`json
["Building A", "Building B", "Main Campus", "Sports Complex"]
\`\`\`

### 5. Get Club Statistics (Public)
**GET** `/clubs/stats`

#### Response
\`\`\`json
{
  "totalClubs": 42,
  "categories": ["academic", "sports", "technology"],
  "locations": ["Building A", "Building B"],
  "averageSize": 18.5
}
\`\`\`

### 6. Get Clubs with Member Count (Public)
**GET** `/clubs/member-count`

#### Response
\`\`\`json
[
  {
    "id": "club_id_1",
    "name": "Tech Club",
    "member_count": 45
  },
  {
    "id": "club_id_2", 
    "name": "Sports Club",
    "member_count": 32
  }
]
\`\`\`

### 7. Create Club (Private - Admin Only)
**POST** `/clubs`

#### Request Body
\`\`\`json
{
  "name": "New Tech Club",
  "description": "A club for new technology enthusiasts",
  "category": "technology",
  "location": "Building C, Room 201",
  "contact_email": "newtechclub@university.edu",
  "contact_phone": "+1-555-0456",
  "logo_url": "https://example.com/newlogo.png",
  "website_url": "https://newtechclub.university.edu",
  "social_links": {
    "facebook": "https://facebook.com/newtechclub"
  },
  "settings": {
    "is_public": true,
    "requires_approval": true,
    "max_members": 50
  },
  "manager_user_id": "user_id_123",
  "manager_full_name": "John Doe",
  "manager_email": "john.doe@university.edu"
}
\`\`\`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Club created successfully",
  "data": {
    "id": "new_club_id",
    "name": "New Tech Club",
    "description": "A club for new technology enthusiasts",
    "category": "technology",
    "member_count": 0,
    "manager": {
      "user_id": "user_id_123",
      "full_name": "John Doe",
      "email": "john.doe@university.edu"
    }
  }
}
\`\`\`

### 8. Get Club Recruitments (Public)
**GET** `/clubs/:id/recruitments`

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `draft`, `active`, `paused`, `completed` |
| `page` | number | Page number |
| `limit` | number | Items per page |

#### Response
\`\`\`json
{
  "total": 5,
  "recruitments": [
    {
      "id": "campaign_id_1",
      "title": "Fall 2025 Recruitment",
      "description": "Join our tech club for Fall 2025!",
      "start_date": "2025-08-01T00:00:00.000Z",
      "end_date": "2025-08-31T23:59:59.000Z",
      "status": "active",
      "max_applications": 50,
      "statistics": {
        "total_applications": 12,
        "pending_applications": 8,
        "approved_applications": 3,
        "rejected_applications": 1
      }
    }
  ]
}
\`\`\`

### 9. Get Club Member (Private)
**GET** `/clubs/:clubId/members/:userId`

#### Response
\`\`\`json
{
  "role": "member",
  "joined_at": "2025-07-01T10:00:00.000Z"
}
\`\`\`

## Recruitment Campaign Endpoints

### 1. Create Campaign (Private)
**POST** `/clubs/:clubId/campaigns`

#### Request Body
\`\`\`json
{
  "title": "Fall 2025 Recruitment",
  "description": "Join our amazing tech club!",
  "requirements": [
    "Must be a current student",
    "Interest in technology"
  ],
  "application_questions": [
    {
      "question": "Why do you want to join?",
      "type": "textarea",
      "required": true
    },
    {
      "question": "What's your programming experience?",
      "type": "select",
      "options": ["Beginner", "Intermediate", "Advanced"],
      "required": true
    }
  ],
  "start_date": "2025-08-01T00:00:00.000Z",
  "end_date": "2025-08-31T23:59:59.000Z",
  "max_applications": 50,
  "status": "draft"
}
\`\`\`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Campaign created as draft successfully",
  "data": {
    "id": "campaign_id_1",
    "title": "Fall 2025 Recruitment",
    "status": "draft",
    "club_id": "club_id_1",
    "created_at": "2025-07-16T10:00:00.000Z"
  }
}
\`\`\`

### 2. Get Campaigns for Club (Private)
**GET** `/clubs/:clubId/campaigns`

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sort` | string | Sort by: `title`, `start_date`, `end_date`, `created_at` |

#### Response
\`\`\`json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "campaign_id_1",
        "title": "Fall 2025 Recruitment",
        "status": "active",
        "start_date": "2025-08-01T00:00:00.000Z",
        "end_date": "2025-08-31T23:59:59.000Z",
        "statistics": {
          "total_applications": 12,
          "pending_applications": 8
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 10
    }
  }
}
\`\`\`

### 3. Get Campaign by ID (Public/Private)
**GET** `/clubs/:clubId/campaigns/:campaignId`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Campaign retrieved successfully",
  "data": {
    "id": "campaign_id_1",
    "club_id": "club_id_1",
    "title": "Fall 2025 Recruitment",
    "description": "Join our amazing tech club!",
    "requirements": [
      "Must be a current student",
      "Interest in technology"
    ],
    "application_questions": [
      {
        "question": "Why do you want to join?",
        "type": "textarea",
        "required": true
      }
    ],
    "start_date": "2025-08-01T00:00:00.000Z",
    "end_date": "2025-08-31T23:59:59.000Z",
    "max_applications": 50,
    "status": "active",
    "statistics": {
      "total_applications": 12,
      "approved_applications": 3,
      "rejected_applications": 1,
      "pending_applications": 8
    }
  }
}
\`\`\`

### 4. Update Campaign (Private)
**PUT** `/clubs/:clubId/campaigns/:campaignId`

#### Request Body
\`\`\`json
{
  "title": "Updated Fall 2025 Recruitment",
  "description": "Updated description",
  "max_applications": 75
}
\`\`\`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "id": "campaign_id_1",
    "title": "Updated Fall 2025 Recruitment",
    "updated_at": "2025-07-16T11:00:00.000Z"
  }
}
\`\`\`

### 5. Delete Campaign (Private)
**DELETE** `/clubs/:clubId/campaigns/:campaignId`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
\`\`\`

### 6. Campaign Status Management (Private)

#### Publish Campaign
**POST** `/clubs/:clubId/campaigns/:campaignId/publish`

#### Pause Campaign
**POST** `/clubs/:clubId/campaigns/:campaignId/pause`

#### Resume Campaign
**POST** `/clubs/:clubId/campaigns/:campaignId/resume`

#### Complete Campaign
**POST** `/clubs/:clubId/campaigns/:campaignId/complete`

All status endpoints return:
\`\`\`json
{
  "success": true,
  "message": "Campaign {action} successfully",
  "data": {
    "id": "campaign_id_1",
    "status": "new_status",
    "updated_at": "2025-07-16T12:00:00.000Z"
  }
}
\`\`\`

### 7. Get Active Campaigns (Public)
**GET** `/campaigns/active`

#### Response
\`\`\`json
{
  "success": true,
  "message": "Active campaigns retrieved successfully",
  "data": [
    {
      "id": "campaign_id_1",
      "club_id": "club_id_1",
      "club_name": "Tech Club",
      "title": "Fall 2025 Recruitment",
      "description": "Join our amazing tech club!",
      "start_date": "2025-08-01T00:00:00.000Z",
      "end_date": "2025-08-31T23:59:59.000Z",
      "status": "active"
    }
  ]
}
\`\`\`

## Error Handling

### Standard Error Response
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "error": "Stack trace (development only)"
}
\`\`\`

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Validation Errors
Validation errors include detailed field-level errors:
\`\`\`json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Category must be one of: academic, sports, arts, technology, social, volunteer, cultural, other",
    "Email must be a valid email address"
  ]
}
\`\`\`

## Frontend Integration Examples

### JavaScript/TypeScript Examples

#### Fetch All Clubs with Search
\`\`\`javascript
const fetchClubs = async (searchParams = {}) => {
  const params = new URLSearchParams(searchParams);
  
  try {
    const response = await fetch(`/api/clubs?${params}`, {
      headers: {
        'X-API-Gateway-Secret': process.env.REACT_APP_API_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data; // Contains pagination info and results
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};

// Usage
const clubs = await fetchClubs({
  search: 'tech',
  category: 'technology',
  page: 1,
  limit: 20,
  sort: 'name'
});
\`\`\`

#### Create a Club
\`\`\`javascript
const createClub = async (clubData, authToken) => {
  try {
    const response = await fetch('/api/clubs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-API-Gateway-Secret': process.env.REACT_APP_API_SECRET
      },
      body: JSON.stringify(clubData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};
\`\`\`

#### Manage Campaign Status
\`\`\`javascript
const updateCampaignStatus = async (clubId, campaignId, action, authToken) => {
  try {
    const response = await fetch(`/api/clubs/${clubId}/campaigns/${campaignId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-API-Gateway-Secret': process.env.REACT_APP_API_SECRET
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error ${action} campaign:`, error);
    throw error;
  }
};

// Usage
await updateCampaignStatus('club123', 'campaign456', 'publish', userToken);
\`\`\`

## Notes

1. **CORS**: The service is configured to accept requests from `http://localhost:3000` (frontend development server)

2. **Pagination**: All list endpoints support pagination. Always check the pagination metadata in responses

3. **Search**: The search functionality performs case-insensitive partial matching across multiple fields

4. **Status Management**: Campaign status follows a specific workflow: `draft` → `active` → `paused`/`completed`

5. **Validation**: All endpoints perform input validation. Check error responses for detailed validation messages

6. **Backward Compatibility**: Some fields like `type` and `size` are maintained for backward compatibility

7. **Manager Assignment**: When creating clubs, manager information is required and stored for access control

8. **Public vs Private**: Public endpoints are accessible without user authentication, private endpoints require user authentication and appropriate roles

This documentation should provide frontend developers with all the necessary information to integrate with the club service APIs effectively.
