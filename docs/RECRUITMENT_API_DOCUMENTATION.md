# 📋 Recruitment System API Documentation

## Overview

This document provides comprehensive API documentation for all recruitment-related functionality in the Club Management System. The APIs are organized by user roles and core business functionality.

## 🔐 Authentication & Authorization

All protected endpoints require JWT authentication via API Gateway. Headers injected by API Gateway:
- `x-user-id`: User ID
- `x-user-email`: User email  
- `x-user-role`: System role (USER, ADMIN)

### User Roles

#### System Level Roles
- **USER**: Regular authenticated user
- **ADMIN**: System administrator

#### Club Level Roles
- **member**: Basic club member
- **organizer**: Club organizer (can help manage events)
- **club_manager**: Club manager (full permissions for club operations)

---

## 🎯 API Endpoints by User Role

### 1️⃣ Public/Guest Users (No Authentication Required)

#### Browse Published Recruitment Campaigns

<details>
<summary><strong>GET /api/campaigns/published</strong> - Get all published recruitment campaigns</summary>

**Description**: Retrieve all currently published recruitment campaigns across all clubs.

**Request**:
```http
GET /api/campaigns/published?page=1&limit=10&club_id=12345
Authorization: None required
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 50) |
| club_id | string | No | Filter by specific club ID |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Published campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "60d0fe4f5311236168a109cd",
        "club_id": "60d0fe4f5311236168a109ca",
        "club_name": "Câu lạc bộ Và Truyền thông",
        "title": "Fall 2025 Recruitment - Tech Club",
        "description": "Join our tech club for exciting programming workshops and hackathons",
        "requirements": [
          "Basic programming knowledge",
          "Passion for technology"
        ],
        "application_questions": [
          {
            "id": "q1",
            "question": "What programming languages are you familiar with?",
            "type": "textarea",
            "required": true,
            "max_length": 500
          },
          {
            "id": "q2", 
            "question": "Why do you want to join our club?",
            "type": "textarea",
            "required": true,
            "max_length": 300
          }
        ],
        "start_date": "2025-09-01T00:00:00Z",
        "end_date": "2025-09-15T23:59:59Z",
        "max_applications": 50,
        "status": "published",
        "statistics": {
          "total_applications": 15,
          "approved_applications": 0,
          "rejected_applications": 0,
          "pending_applications": 15,
          "last_updated": "2025-07-18T10:30:00Z"
        },
        "created_at": "2025-07-15T08:00:00Z",
        "updated_at": "2025-07-18T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Invalid query parameters"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error"
}
```
</details>

<details>
<summary><strong>GET /api/campaigns/clubs/{clubId}/published</strong> - Get published campaigns for specific club</summary>

**Description**: Retrieve all published recruitment campaigns for a specific club.

**Request**:
```http
GET /api/campaigns/clubs/60d0fe4f5311236168a109ca/published
Authorization: None required
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clubId | string | Yes | MongoDB ObjectID of the club |

**Response**: Same format as GET /api/campaigns/published but filtered by club.
</details>

<details>
<summary><strong>GET /api/campaigns/{campaignId}</strong> - Get specific campaign details</summary>

**Description**: Get detailed information about a specific published recruitment campaign.

**Request**:
```http
GET /api/campaigns/60d0fe4f5311236168a109cd
Authorization: None required
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| campaignId | string | Yes | MongoDB ObjectID of the campaign |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign details retrieved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Fall 2025 Recruitment - Tech Club",
    "description": "Join our tech club for exciting programming workshops and hackathons",
    "requirements": [
      "Basic programming knowledge",
      "Passion for technology"
    ],
    "application_questions": [
      {
        "id": "q1",
        "question": "What programming languages are you familiar with?",
        "type": "textarea",
        "required": true,
        "max_length": 500
      }
    ],
    "start_date": "2025-09-01T00:00:00Z",
    "end_date": "2025-09-15T23:59:59Z",
    "max_applications": 50,
    "status": "published",
    "statistics": {
      "total_applications": 15,
      "approved_applications": 0,
      "rejected_applications": 0,
      "pending_applications": 15
    },
    "created_at": "2025-07-15T08:00:00Z",
    "updated_at": "2025-07-18T10:30:00Z"
  }
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Campaign not found or not published"
}

// 400 Bad Request
{
  "success": false,
  "message": "Invalid campaign ID format"
}
```
</details>

#### Legacy Club Recruitment Routes

<details>
<summary><strong>GET /api/clubs/{clubId}/recruitments</strong> - Get club recruitment rounds (Legacy)</summary>

**Description**: Legacy endpoint for backward compatibility. Returns basic recruitment information.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/recruitments
Authorization: None required
```

**Response** (200 OK):
```json
[
  {
    "id": "60d0fe4f5311236168a109cd",
    "title": "Fall 2025 Recruitment",
    "start_at": "2025-09-01T00:00:00Z",
    "status": "OPEN"
  },
  {
    "id": "60d0fe4f5311236168a109ce", 
    "title": "Spring 2025 Recruitment",
    "start_at": "2025-03-01T00:00:00Z",
    "status": "CLOSED"
  }
]
```
</details>

---

### 2️⃣ Authenticated Users (USER Role)

#### Submit and Manage Applications

<details>
<summary><strong>POST /api/campaigns/{campaignId}/apply</strong> - Submit recruitment application</summary>

**Description**: Submit an application to a published recruitment campaign.

**Request**:
```http
POST /api/campaigns/60d0fe4f5311236168a109cd/apply
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "application_message": "I am passionate about technology and would love to contribute to the club's activities through my programming skills and enthusiasm for learning new technologies.",
  "application_answers": {
    "q1": "I am familiar with JavaScript, Python, React, and Node.js. I have built several web applications and contributed to open source projects.",
    "q2": "I want to join the tech club to learn new technologies, collaborate on innovative projects, and connect with like-minded individuals."
  }
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| application_message | string | No | General application message (max 1000 chars) |
| application_answers | object | No | Answers to campaign-specific questions |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "user_id": "auth-user-123",
    "user_email": "john.doe@example.com",
    "status": "pending",
    "application_message": "I am passionate about technology...",
    "application_answers": {
      "q1": "I am familiar with JavaScript, Python, and React...",
      "q2": "I want to join the tech club to learn new technologies..."
    },
    "submitted_at": "2025-07-18T14:30:00Z"
  }
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Campaign not found or not accepting applications"
}

// 409 Conflict
{
  "success": false,
  "message": "You have already applied to this campaign"
}

// 400 Bad Request
{
  "success": false,
  "message": "Campaign application period has ended"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```
</details>

<details>
<summary><strong>GET /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Get application status</summary>

**Description**: Get details and status of a specific application. Users can only view their own applications.

**Request**:
```http
GET /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "campaign_title": "Fall 2025 Recruitment - Tech Club",
    "club_name": "Tech Club",
    "status": "pending",
    "application_message": "I am passionate about technology...",
    "application_answers": {
      "q1": "I am familiar with JavaScript, Python, and React...",
      "q2": "I want to join the tech club to learn new technologies..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T14:30:00Z",
    "feedback": null
  }
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Application not found"
}

// 403 Forbidden
{
  "success": false,
  "message": "You can only view your own applications"
}
```
</details>

<details>
<summary><strong>PUT /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Update application</summary>

**Description**: Update a pending application. Only allowed if campaign allows editing and application is still pending.

**Request**:
```http
PUT /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "application_message": "Updated: I am passionate about technology and have recent experience with AI...",
  "application_answers": {
    "q1": "Updated: I am familiar with JavaScript, Python, React, and recently learned machine learning with TensorFlow...",
    "q2": "I want to join the tech club to learn new technologies, collaborate on AI projects, and contribute to the community."
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "status": "pending",
    "application_message": "Updated: I am passionate about technology and have recent experience with AI...",
    "application_answers": {
      "q1": "Updated: I am familiar with JavaScript, Python, React, and recently learned machine learning...",
      "q2": "I want to join the tech club to learn new technologies, collaborate on AI projects..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T16:45:00Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Application editing is not allowed for this campaign"
}

// 400 Bad Request
{
  "success": false,
  "message": "Cannot edit application that has been reviewed"
}
```
</details>

<details>
<summary><strong>DELETE /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Withdraw application</summary>

**Description**: Withdraw/cancel an application. Only pending applications can be withdrawn.

**Request**:
```http
DELETE /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application withdrawn successfully"
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Cannot withdraw application that has been processed"
}

// 404 Not Found
{
  "success": false,
  "message": "Application not found"
}
```
</details>

#### View User's Own Applications

<details>
<summary><strong>GET /api/users/{userId}/applications</strong> - Get all user applications</summary>

**Description**: Get all applications submitted by the authenticated user.

**Request**:
```http
GET /api/users/auth-user-123/applications?page=1&limit=10&status=pending
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (pending, approved, rejected) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "60d0fe4f5311236168a109cf",
        "campaign_id": "60d0fe4f5311236168a109cd",
        "campaign_title": "Fall 2025 Recruitment - Tech Club",
        "club_name": "Tech Club",
        "club_id": "60d0fe4f5311236168a109ca",
        "status": "pending",
        "application_message": "I am passionate about technology...",
        "application_answers": {
          "q1": "I am familiar with JavaScript, Python, and React...",
          "q2": "I want to join the tech club to learn new technologies..."
        },
        "submitted_at": "2025-07-18T14:30:00Z",
        "updated_at": "2025-07-18T16:45:00Z"
      },
      {
        "id": "60d0fe4f5311236168a109d0",
        "campaign_id": "60d0fe4f5311236168a109ce",
        "campaign_title": "Spring 2025 Recruitment - Art Club",
        "club_name": "Art Club",
        "club_id": "60d0fe4f5311236168a109cb",
        "status": "approved",
        "application_message": "I love creating digital art...",
        "application_answers": {
          "q1": "I have experience with Photoshop, Illustrator...",
          "q2": "I want to develop my artistic skills..."
        },
        "submitted_at": "2025-03-10T10:15:00Z",
        "updated_at": "2025-03-15T14:20:00Z",
        "feedback": "Great portfolio! Welcome to the Art Club."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 2,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

**Error Responses**:
```json
// 403 Forbidden
{
  "success": false,
  "message": "You can only view your own applications"
}
```
</details>

---

#### Direct Application Management Routes

<details>
<summary><strong>GET /api/applications/{applicationId}</strong> - Get application details directly</summary>

**Description**: Get details of a specific application using the application ID directly. Users can only view their own applications.

**Request**:
```http
GET /api/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationId | string | Yes | MongoDB ObjectID of the application |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "campaign_title": "Fall 2025 Recruitment - Tech Club",
    "club_name": "Tech Club",
    "club_id": "60d0fe4f5311236168a109ca",
    "status": "pending",
    "application_message": "I am passionate about technology...",
    "application_answers": {
      "q1": "I am familiar with JavaScript, Python, and React...",
      "q2": "I want to join the tech club to learn new technologies..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T14:30:00Z",
    "feedback": null
  }
}
```
</details>

<details>
<summary><strong>PUT /api/applications/{applicationId}</strong> - Update application directly</summary>

**Description**: Update a pending application using the application ID directly. Only allowed if application is still pending.

**Request**:
```http
PUT /api/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "application_message": "Updated: I am passionate about technology and have recent experience with AI...",
  "application_answers": {
    "q1": "Updated: I am familiar with JavaScript, Python, React, and recently learned machine learning with TensorFlow...",
    "q2": "I want to join the tech club to learn new technologies, collaborate on AI projects, and contribute to the community."
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "status": "pending",
    "application_message": "Updated: I am passionate about technology and have recent experience with AI...",
    "application_answers": {
      "q1": "Updated: I am familiar with JavaScript, Python, React, and recently learned machine learning...",
      "q2": "I want to join the tech club to learn new technologies, collaborate on AI projects..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T16:45:00Z"
  }
}
```
</details>

<details>
<summary><strong>DELETE /api/applications/{applicationId}</strong> - Withdraw application directly</summary>

**Description**: Withdraw/cancel an application using the application ID directly. Only pending applications can be withdrawn.

**Request**:
```http
DELETE /api/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application withdrawn successfully"
}
```
</details>

---

### 3️⃣ Club Managers (club_manager role)

#### Campaign Management

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns</strong> - Create recruitment campaign</summary>

**Description**: Create a new recruitment campaign for the club. Only club managers can create campaigns.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Fall 2025 Recruitment - Tech Club",
  "description": "Join our tech club for exciting programming workshops, hackathons, and networking opportunities with industry professionals.",
  "requirements": [
    "Basic programming knowledge in any language",
    "Passion for technology and innovation",
    "Commitment to attend regular meetings"
  ],
  "application_questions": [
    {
      "id": "q1",
      "question": "What programming languages are you familiar with?",
      "type": "textarea",
      "required": true,
      "max_length": 500
    },
    {
      "id": "q2",
      "question": "Describe a project you've worked on that you're proud of",
      "type": "textarea",
      "required": false,
      "max_length": 800
    },
    {
      "id": "q3",
      "question": "What areas of technology are you most interested in?",
      "type": "select",
      "required": true,
      "options": ["Web Development", "Mobile Development", "AI/ML", "Data Science", "Cybersecurity", "Other"]
    }
  ],
  "start_date": "2025-09-01T00:00:00Z",
  "end_date": "2025-09-15T23:59:59Z",
  "max_applications": 50,
  "status": "draft"
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Campaign title (max 200 chars) |
| description | string | Yes | Campaign description (max 2000 chars) |
| requirements | array | No | List of requirements (each max 250 chars) |
| application_questions | array | No | Custom application questions |
| start_date | string (ISO) | Yes | Campaign start date |
| end_date | string (ISO) | Yes | Campaign end date |
| max_applications | number | No | Maximum number of applications |
| status | string | No | Initial status (default: "draft") |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Campaign created as draft successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Fall 2025 Recruitment - Tech Club",
    "description": "Join our tech club for exciting programming workshops...",
    "requirements": [
      "Basic programming knowledge in any language",
      "Passion for technology and innovation",
      "Commitment to attend regular meetings"
    ],
    "application_questions": [
      {
        "id": "q1",
        "question": "What programming languages are you familiar with?",
        "type": "textarea",
        "required": true,
        "max_length": 500
      }
    ],
    "start_date": "2025-09-01T00:00:00Z",
    "end_date": "2025-09-15T23:59:59Z",
    "max_applications": 50,
    "status": "draft",
    "statistics": {
      "total_applications": 0,
      "approved_applications": 0,
      "rejected_applications": 0,
      "pending_applications": 0,
      "last_updated": "2025-07-18T10:30:00Z"
    },
    "created_by": "auth-user-123",
    "created_at": "2025-07-18T10:30:00Z",
    "updated_at": "2025-07-18T10:30:00Z"
  }
}
```

**Error Responses**:
```json
// 403 Forbidden
{
  "success": false,
  "message": "Insufficient permissions. Only club managers can create campaigns"
}

// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "End date must be after start date",
    "Title is required"
  ]
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns</strong> - Get club's campaigns</summary>

**Description**: /**
 * @route GET /api/clubs/:clubId/campaigns
 * @desc Get campaigns for a club with optional status filter
 * @query status - Comma-separated list of statuses to filter by (draft,published,completed,paused)
 * @query page - Page number for pagination
 * @query limit - Number of items per page
 * @query sort - Sort field
 * @access Private (Club Manager only)
 * @example /api/clubs/:clubId/campaigns?status=published,draft&page=1&limit=10
 */

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns?status=published,draft&page=1&limit=10
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "60d0fe4f5311236168a109cd",
        "club_id": "60d0fe4f5311236168a109ca",
        "title": "Fall 2025 Recruitment - Tech Club",
        "description": "Join our tech club for exciting programming workshops...",
        "requirements": [
          "Basic programming knowledge in any language",
          "Passion for technology and innovation"
        ],
        "application_questions": [
          {
            "id": "q1",
            "question": "What programming languages are you familiar with?",
            "type": "textarea",
            "required": true,
            "max_length": 500
          }
        ],
        "start_date": "2025-09-01T00:00:00Z",
        "end_date": "2025-09-15T23:59:59Z",
        "max_applications": 50,
        "status": "draft",
        "statistics": {
          "total_applications": 0,
          "approved_applications": 0,
          "rejected_applications": 0,
          "pending_applications": 0,
          "last_updated": "2025-07-18T10:30:00Z"
        },
        "created_by": "auth-user-123",
        "created_at": "2025-07-18T10:30:00Z",
        "updated_at": "2025-07-18T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Get specific campaign details</summary>

**Description**: Get detailed information about a specific campaign. Club managers can see draft campaigns.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
```

**Response**: Same format as create campaign response with full campaign details.
</details>

<details>
<summary><strong>PUT /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Update campaign</summary>

**Description**: Update an existing campaign. Only draft campaigns can be fully edited.

**Request**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**: Same format as create campaign, but all fields are optional.

**Response**: Same format as create campaign response with updated data.

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Cannot edit published campaign. Only description and end date can be modified."
}
```
</details>

<details>
<summary><strong>DELETE /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Delete campaign</summary>

**Description**: Delete a campaign. Only draft campaigns can be deleted.

**Request**:
```http
DELETE /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Cannot delete published campaign with existing applications"
}
```
</details>

#### Campaign Status Management

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/publish</strong> - Publish campaign</summary>

**Description**: Change campaign status from draft to published, making it visible to users.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/publish
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign published successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Fall 2025 Recruitment - Tech Club",
    "status": "published",
    "published_at": "2025-07-18T11:00:00Z",
    "updated_at": "2025-07-18T11:00:00Z"
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/pause</strong> - Pause campaign</summary>

**Description**: Temporarily pause a published campaign to stop accepting new applications.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/pause
Authorization: Bearer {jwt_token}
```

**Response**: Similar to publish response with status "paused".
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/resume</strong> - Resume campaign</summary>

**Description**: Resume a paused campaign to continue accepting applications.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/resume
Authorization: Bearer {jwt_token}
```

**Response**: Similar to publish response with status "published".
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/complete</strong> - Complete campaign</summary>

**Description**: Mark campaign as completed, stopping all applications and finalizing the recruitment.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/complete
Authorization: Bearer {jwt_token}
```

**Response**: Similar to publish response with status "completed".
</details>

#### Application Review & Management

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}/applications</strong> - Get campaign applications</summary>

**Description**: Get all applications for a specific campaign. Only accessible by club managers.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications?page=1&limit=10&status=pending
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (pending, approved, rejected) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "60d0fe4f5311236168a109cf",
        "user_id": "auth-user-123",
        "user_email": "john.doe@example.com",
        "status": "pending",
        "application_message": "I am passionate about technology...",
        "application_answers": {
          "q1": "I am familiar with JavaScript, Python, and React...",
          "q2": "I want to join the tech club to learn new technologies..."
        },
        "submitted_at": "2025-07-18T14:30:00Z",
        "updated_at": "2025-07-18T16:45:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_applications": 15,
      "pending_applications": 12,
      "approved_applications": 2,
      "rejected_applications": 1
    }
  }
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}</strong> - Get application details</summary>

**Description**: Get detailed information about a specific application.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application details retrieved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "user_id": "auth-user-123",
    "user_email": "john.doe@example.com",
    "user_profile": {
      "full_name": "John Doe",
      "email": "john.doe@example.com"
    },
    "status": "pending",
    "application_message": "I am passionate about technology and would love to contribute to the club's activities.",
    "application_answers": {
      "q1": "I am familiar with JavaScript, Python, and React. I have built several web applications and contributed to open source projects.",
      "q2": "I want to join the tech club to learn new technologies, collaborate on projects, and connect with like-minded peers.",
      "q3": "Web Development"
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T16:45:00Z",
    "review_notes": null,
    "reviewed_by": null,
    "reviewed_at": null
  }
}
```
</details>

<details>
<summary><strong>PUT /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/status</strong> - Update application status</summary>

**Description**: Update the status of an application with optional review notes.

**Request**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/status
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "approved",
  "notes": "Excellent technical background and enthusiasm. Welcome to the team!"
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | New status (approved, rejected, pending) |
| notes | string | No | Review notes (max 1000 chars) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "status": "approved",
    "review_notes": "Excellent technical background and enthusiasm. Welcome to the team!",
    "reviewed_by": "club-manager-456",
    "reviewed_at": "2025-07-18T17:00:00Z",
    "updated_at": "2025-07-18T17:00:00Z"
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/approve</strong> - Approve and add to club</summary>

**Description**: Approve an application and automatically add the user to the club with specified role.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/approve
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "role": "member",
  "notes": "Welcome to the Tech Club! Looking forward to your contributions."
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role | string | No | Club role (default: "member") |
| notes | string | No | Welcome message/notes |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application approved and user added to club successfully",
  "data": {
    "application": {
      "id": "60d0fe4f5311236168a109cf",
      "status": "approved",
      "review_notes": "Welcome to the Tech Club! Looking forward to your contributions.",
      "reviewed_by": "club-manager-456",
      "reviewed_at": "2025-07-18T17:00:00Z"
    },
    "membership": {
      "id": "60d0fe4f5311236168a109d1",
      "club_id": "60d0fe4f5311236168a109ca",
      "user_id": "auth-user-123",
      "role": "member",
      "status": "active",
      "joined_at": "2025-07-18T17:00:00Z"
    }
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/reject</strong> - Reject application</summary>

**Description**: Reject an application with optional reason and feedback.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/reject
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "reason": "insufficient_experience",
  "notes": "Thank you for your interest. We encourage you to gain more experience and apply again next semester."
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reason | string | No | Rejection reason code |
| notes | string | No | Detailed feedback (max 1000 chars) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application rejected successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "status": "rejected",
    "rejection_reason": "insufficient_experience",
    "review_notes": "Thank you for your interest. We encourage you to gain more experience and apply again next semester.",
    "reviewed_by": "club-manager-456",
    "reviewed_at": "2025-07-18T17:00:00Z",
    "updated_at": "2025-07-18T17:00:00Z"
  }
}
```
</details>

#### Simplified Application Management Routes

<details>
<summary><strong>PUT /api/clubs/{clubId}/applications/{applicationId}/status</strong> - Update application status (Simplified)</summary>

**Description**: Simplified route to update application status without requiring campaign ID.

**Request**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/applications/60d0fe4f5311236168a109cf/status
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request/Response**: Same format as the full route above.
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/applications/{applicationId}/approve</strong> - Approve application (Simplified)</summary>

**Description**: Simplified route to approve application and add user to club.

**Request**: Same format as full route.
**Response**: Same format as full route.
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/applications/{applicationId}/reject</strong> - Reject application (Simplified)</summary>

**Description**: Simplified route to reject application.

**Request**: Same format as full route.
**Response**: Same format as full route.
</details>

---

### 4️⃣ System Administrators (ADMIN Role)

#### Advanced User Application Management

<details>
<summary><strong>GET /api/users/{userId}/applications</strong> - Get any user's applications (Admin only)</summary>

**Description**: System administrators can view applications for any user.

**Request**:
```http
GET /api/users/any-user-id/applications?page=1&limit=10
Authorization: Bearer {admin_jwt_token}
```

**Response**: Same format as user's own applications endpoint.

**Additional Permissions**:
- Can view applications for any user
- Can access system-wide application statistics
- Can override club manager decisions (implementation dependent)
</details>

---

## 🔧 Data Models

### Campaign Object
```typescript
interface Campaign {
  id: string;                    // MongoDB ObjectID
  club_id: string;              // Reference to club
  title: string;                // Campaign title (max 200 chars)
  description: string;          // Campaign description (max 2000 chars)
  requirements: string[];       // List of requirements
  application_questions: ApplicationQuestion[];
  start_date: string;           // ISO 8601 date string
  end_date: string;             // ISO 8601 date string
  max_applications?: number;    // Maximum applications allowed
  status: 'draft' | 'published' | 'paused' | 'completed';
  statistics: CampaignStatistics;
  created_by: string;           // User ID who created
  created_at: string;           // ISO 8601 date string
  updated_at: string;           // ISO 8601 date string
}
```

### Application Question Object
```typescript
interface ApplicationQuestion {
  id: string;                   // Unique question ID
  question: string;             // Question text (max 500 chars)
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;            // Is answer required
  max_length?: number;          // Max answer length for text fields
  options?: string[];           // Options for select/checkbox
}
```

### Application Object
```typescript
interface Application {
  id: string;                   // MongoDB ObjectID
  campaign_id: string;          // Reference to campaign
  user_id: string;             // User ID from auth service
  user_email: string;          // User email
  status: 'pending' | 'approved' | 'rejected';
  application_message?: string; // General message (max 1000 chars)
  application_answers: Record<string, string>; // Question ID -> Answer
  submitted_at: string;         // ISO 8601 date string
  updated_at: string;          // ISO 8601 date string
  review_notes?: string;        // Manager's review notes
  reviewed_by?: string;         // Manager who reviewed
  reviewed_at?: string;         // When reviewed
  rejection_reason?: string;    // Reason code for rejection
}
```

### Campaign Statistics Object
```typescript
interface CampaignStatistics {
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  last_updated: string;         // ISO 8601 date string
}
```

### Membership Object
```typescript
interface Membership {
  id: string;                   // MongoDB ObjectID
  club_id: string;             // Reference to club
  user_id: string;             // User ID from auth service
  campaign_id?: string;         // Reference to recruitment campaign
  role: 'member' | 'organizer' | 'club_manager';
  status: 'active' | 'pending' | 'rejected' | 'removed';
  joined_at: string;           // ISO 8601 date string
  approved_by?: string;         // Who approved the membership
  approved_at?: string;         // When approved
}
```

---

## 🔄 Status Flow Diagrams

### Campaign Status Flow
```
draft → published → paused ⟷ published → completed
   ↓
deleted (only for draft)
```

### Application Status Flow
```
                    submitted
                        ↓
                    pending
                   ↙       ↘
              approved    rejected
                 ↓
           added to club
```

---

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human readable error message",
  "error_code": "ERROR_CODE",           // Optional
  "errors": ["Validation error 1"],     // Optional for validation errors
  "details": { }                        // Optional additional details
}
```

### Common HTTP Status Codes

| Status | Description | When Used |
|--------|-------------|-----------|
| 200 | Success | Successful GET, PUT, DELETE operations |
| 201 | Created | Successful POST operations |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists, state conflicts |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal server errors |

---

## 📝 Implementation Notes

### Security Considerations
1. All protected endpoints require valid JWT tokens
2. Role-based access control enforced at middleware level
3. Users can only access their own applications unless they're club managers/admins
4. Club managers can only manage campaigns for their clubs
5. Input validation and sanitization applied to all requests

### Performance Considerations
1. Pagination implemented on all list endpoints
2. Database indexes on frequently queried fields
3. Caching strategies for public campaign data
4. Rate limiting on application submission endpoints

### Business Rules
1. Users cannot apply to the same campaign twice
2. Applications can only be edited if campaign allows and status is pending
3. Draft campaigns can be fully edited, published campaigns have limited editability
4. Campaign end dates cannot be in the past
5. Maximum application limits enforced at campaign level

This API documentation provides the frontend team with all necessary information to implement the recruitment functionality, including detailed request/response formats, error handling, and business logic constraints.

---

## 🏢 Additional Club Management APIs

### Public Club Information Endpoints

<details>
<summary><strong>GET /api/clubs/categories</strong> - Get available club categories</summary>

**Description**: Get all available club categories for filtering purposes.

**Request**:
```http
GET /api/clubs/categories
Authorization: None required
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    "Technology",
    "Sports",
    "Arts & Culture",
    "Academic",
    "Volunteer & Service",
    "Business & Entrepreneurship",
    "Other"
  ]
}
```
</details>

<details>
<summary><strong>GET /api/clubs/locations</strong> - Get available club locations</summary>

**Description**: Get all available club locations for filtering purposes.

**Request**:
```http
GET /api/clubs/locations
Authorization: None required
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Locations retrieved successfully",
  "data": [
    "Main Campus",
    "North Campus",
    "Online",
    "City Center",
    "Library Building"
  ]
}
```
</details>

<details>
<summary><strong>GET /api/clubs/stats</strong> - Get club statistics</summary>

**Description**: Get overall club statistics for search context and insights.

**Request**:
```http
GET /api/clubs/stats
Authorization: None required
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Club statistics retrieved successfully",
  "data": {
    "total_clubs": 45,
    "active_clubs": 42,
    "total_members": 1250,
    "categories_count": {
      "Technology": 8,
      "Sports": 12,
      "Arts & Culture": 10,
      "Academic": 15,
      "Other": 0
    },
    "locations_count": {
      "Main Campus": 25,
      "North Campus": 12,
      "Online": 8,
      "City Center": 2
    }
  }
}
```
</details>

<details>
<summary><strong>GET /api/clubs</strong> - Get all clubs with filtering</summary>

**Description**: Get all clubs with advanced filtering, search, and pagination options.

**Request**:
```http
GET /api/clubs?search=tech&category=Technology&location=Main Campus&sort=name&page=1&limit=10
Authorization: None required
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search across name, description, category, location |
| name | string | No | Filter by club name (partial match) |
| category | string | No | Filter by category (exact match) |
| location | string | No | Filter by location (partial match) |
| status | string | No | Filter by status (ACTIVE, INACTIVE) |
| sort | string | No | Sort by: name, name_desc, category, location, newest, oldest, relevance |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Clubs retrieved successfully",
  "data": {
    "clubs": [
      {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Tech Innovation Club",
        "description": "A club focused on emerging technologies and innovation",
        "category": "Technology",
        "location": "Main Campus",
        "status": "ACTIVE",
        "member_count": 45,
        "logo_url": "https://example.com/logo.png",
        "contact_email": "tech@university.edu",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{id}</strong> - Get club details</summary>

**Description**: Get detailed information about a specific club including recruitment and event information.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca
Authorization: None required
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Club retrieved successfully",
  "data": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "Tech Innovation Club",
    "description": "A club focused on emerging technologies and innovation...",
    "category": "Technology",
    "location": "Main Campus",
    "status": "ACTIVE",
    "member_count": 45,
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://techclub.university.edu",
    "contact_email": "tech@university.edu",
    "contact_phone": "+1-555-0123",
    "social_links": {
      "facebook": "https://facebook.com/techclub",
      "instagram": "@techclub_uni"
    },
    "manager": {
      "user_id": "manager-123",
      "full_name": "John Doe",
      "email": "john.doe@university.edu"
    },
    "current_recruitments": [
      {
        "id": "60d0fe4f5311236168a109cd",
        "title": "Fall 2025 Recruitment",
        "status": "published",
        "end_date": "2025-09-15T23:59:59Z"
      }
    ],
    "total_recruitments": 5,
    "active_recruitments": 1,
    "upcoming_events": [
      {
        "id": "event-123",
        "title": "Tech Workshop: AI Fundamentals",
        "start_date": "2025-08-01T14:00:00Z"
      }
    ],
    "published_events": [
      {
        "id": "event-124",
        "title": "Hackathon 2025",
        "start_date": "2025-09-10T09:00:00Z"
      }
    ],
    "total_events": 12,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2025-07-20T08:30:00Z"
  }
}
```
</details>

### Club Membership Management

<details>
<summary><strong>GET /api/users/{userId}/club-roles</strong> - Get user's club roles</summary>

**Description**: Get all club roles and memberships for a specific user.

**Request**:
```http
GET /api/users/auth-user-123/club-roles
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User club roles retrieved successfully",
  "data": [
    {
      "clubId": "60d0fe4f5311236168a109ca",
      "clubName": "Tech Innovation Club",
      "role": "club_manager",
      "joinedAt": "2024-01-15T10:00:00Z"
    },
    {
      "clubId": "60d0fe4f5311236168a109cb",
      "clubName": "Art Society",
      "role": "member",
      "joinedAt": "2024-03-10T14:30:00Z"
    }
  ]
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/members</strong> - Get club members</summary>

**Description**: Get all members of a specific club. Requires club membership to access.

**Request**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/members
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Club members retrieved successfully",
  "data": [
    {
      "user_id": "manager-123",
      "user_email": "john.doe@university.edu",
      "user_full_name": "John Doe",
      "role": "club_manager",
      "joined_at": "2024-01-15T10:00:00Z",
      "status": "active"
    },
    {
      "user_id": "member-456",
      "user_email": "jane.smith@university.edu",
      "user_full_name": "Jane Smith",
      "role": "member",
      "joined_at": "2024-02-20T09:15:00Z",
      "status": "active"
    }
  ]
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/members</strong> - Add club member</summary>

**Description**: Add a new member to the club. Requires club_manager role.

**Request**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/members
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "new-member-789",
  "userEmail": "new.member@university.edu",
  "userFullName": "New Member",
  "role": "member"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "club_id": "60d0fe4f5311236168a109ca",
    "user_id": "new-member-789",
    "user_email": "new.member@university.edu",
    "user_full_name": "New Member",
    "role": "member",
    "status": "active",
    "approved_by": "manager-123",
    "approved_at": "2025-07-26T10:30:00Z"
  }
}
```
</details>

<details>
<summary><strong>PUT /api/clubs/{clubId}/members/{userId}/role</strong> - Update member role</summary>

**Description**: Update a member's role in the club. Requires club_manager role.

**Request**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/members/member-456/role
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "role": "organizer"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "user_id": "member-456",
    "old_role": "member",
    "new_role": "organizer",
    "updated_at": "2025-07-26T10:35:00Z"
  }
}
```
</details>

<details>
<summary><strong>DELETE /api/clubs/{clubId}/members/{userId}</strong> - Remove club member</summary>

**Description**: Remove a member from the club. Requires club_manager role.

**Request**:
```http
DELETE /api/clubs/60d0fe4f5311236168a109ca/members/member-456
Authorization: Bearer {jwt_token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```
</details>

### System Admin Endpoints

<details>
<summary><strong>POST /api/clubs</strong> - Create new club</summary>

**Description**: Create a new club. Requires ADMIN role.

**Request**:
```http
POST /api/clubs
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "New Innovation Club",
  "description": "A club focused on innovation and creativity",
  "category": "Technology",
  "location": "Main Campus",
  "contact_email": "innovation@university.edu",
  "contact_phone": "+1-555-0199",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://innovation.university.edu",
  "manager_user_id": "manager-789",
  "manager_full_name": "Manager Name",
  "manager_email": "manager@university.edu",
  "status": "ACTIVE"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Club created successfully",
  "data": {
    "id": "60d0fe4f5311236168a109cc",
    "name": "New Innovation Club",
    "category": "Technology",
    "status": "ACTIVE",
    "member_count": 1,
    "manager": {
      "user_id": "manager-789",
      "full_name": "Manager Name",
      "email": "manager@university.edu",
      "assigned_at": "2025-07-26T10:40:00Z"
    },
    "created_at": "2025-07-26T10:40:00Z",
    "updated_at": "2025-07-26T10:40:00Z"
  }
}
```
</details>

<details>
<summary><strong>PUT /api/clubs/{id}/status</strong> - Update club status</summary>

**Description**: Update club status (ACTIVE/INACTIVE). Requires ADMIN role.

**Request**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/status
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "INACTIVE"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Club status updated successfully",
  "data": {
    "id": "60d0fe4f5311236168a109ca",
    "old_status": "ACTIVE",
    "new_status": "INACTIVE",
    "updated_at": "2025-07-26T10:45:00Z"
  }
}
```
</details>
