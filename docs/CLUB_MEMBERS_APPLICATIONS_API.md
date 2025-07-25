# 👥 Club Members & User Applications API Documentation

## Overview

This document provides comprehensive API documentation for club member management and user application endpoints in the Club Management System. These endpoints handle retrieving user applications, managing club memberships, and member role administration.

## 🔐 Authentication & Authorization

All endpoints require JWT authentication via API Gateway. Headers injected by API Gateway:
- `x-user-id`: User ID
- `x-user-email`: User email  
- `x-user-role`: System role (USER, ADMIN)

### Permission Levels

#### Club Member Management
- **Club Manager**: Full access to add, update roles, and remove members
- **Organizer**: Can view members only
- **Member**: Can view members only

#### User Applications
- **User**: Can only view their own applications
- **Admin**: System-level access (implementation may vary)

---

## 📋 API Endpoints

### 1️⃣ Club Information Management

#### Get Club Details

<details>
<summary><strong>GET /api/clubs/:id</strong> - Get comprehensive club information</summary>

**Description**: Retrieve detailed information about a specific club including basic details, current recruitment campaigns, upcoming events, published events, and statistics.

**Access**: Public - Uses API Gateway secret validation

**Request**:
```http
GET /api/clubs/64f8b2c1e4b0a1234567890d
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Club ID |

**Response Structure**:
```json
{
  "success": true,
  "message": "Club retrieved successfully",
  "data": {
    "_id": "64f8b2c1e4b0a1234567890d",
    "name": "Tech Innovation Club",
    "description": "A club for technology enthusiasts and innovators",
    "category": "Technology",
    "location": "Computer Science Building, Room 101",
    "contact_email": "tech.club@university.edu",
    "contact_phone": "+1234567890",
    "logo_url": "https://example.com/club-logo.png",
    "website_url": "https://techclub.university.edu",
    "social_links": {
      "facebook": "https://facebook.com/techclub",
      "instagram": "https://instagram.com/techclub",
      "linkedin": "https://linkedin.com/company/techclub"
    },
    "status": "active",
    "member_count": 45,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z",
    "manager": {
      "user_id": "64f8b2c1e4b0a1234567890a",
      "full_name": "John Doe",
      "email": "john.doe@university.edu"
    },
    "current_recruitments": [
      {
        "id": "64f8b2c1e4b0a1234567890c",
        "title": "Spring 2024 Recruitment",
        "description": "Join our tech club for exciting projects",
        "requirements": ["Basic programming knowledge", "Passion for technology"],
        "start_date": "2024-03-01T00:00:00Z",
        "end_date": "2024-03-31T23:59:59Z",
        "max_applications": 50,
        "applications_count": 32,
        "status": "active"
      }
    ],
    "total_recruitments": 5,
    "active_recruitments": 1,
    "upcoming_events": [
      {
        "id": "64f8b2c1e4b0a1234567890e",
        "title": "Tech Workshop: AI Fundamentals",
        "description": "Learn the basics of artificial intelligence",
        "date": "2024-04-15T00:00:00Z",
        "time": "14:00:00",
        "location": "Main Auditorium",
        "fee": 0,
        "max_participants": 100,
        "current_participants": 45,
        "status": "active"
      }
    ],
    "published_events": [
      {
        "id": "64f8b2c1e4b0a1234567890f",
        "title": "Hackathon 2024",
        "description": "Annual programming competition",
        "date": "2024-02-20T00:00:00Z",
        "location": "Tech Lab",
        "participants_count": 80,
        "status": "completed"
      }
    ],
    "total_events": 12
  }
}
```

**Error Responses**:
```json
// 404 Not Found - Club not found
{
  "success": false,
  "message": "Club not found"
}

// 400 Bad Request - Invalid club ID format
{
  "success": false,
  "message": "Invalid club ID format"
}

// 400 Bad Request - Missing club ID
{
  "success": false,
  "message": "Club ID is required"
}
```



</details>

---

### 2️⃣ User Applications Management

#### Get User Applications

<details>
<summary><strong>GET /api/users/:userId/applications</strong> - Get all recruitment applications for a user</summary>

**Description**: Retrieve all recruitment applications submitted by a specific user across all clubs.

**Access**: Private - User can only view their own applications

**Request**:
```http
GET /api/users/64f8b2c1e4b0a1234567890a/applications?page=1&limit=10&status=pending
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID (must match authenticated user) |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status: pending, approved, rejected |

**Response Structure**:
```json
{
  "success": true,
  "message": "User applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "64f8b2c1e4b0a1234567890b",
        "status": "pending",
        "role": "member",
        "application_message": "I am interested in joining this club...",
        "application_answers": [
          {
            "question": "Why do you want to join?",
            "answer": "I have a passion for technology..."
          }
        ],
        "submitted_at": "2024-01-15T10:30:00Z",
        "approved_by": null,
        "approved_at": null,
        "rejection_reason": null,
        "campaign": {
          "id": "64f8b2c1e4b0a1234567890c",
          "title": "Spring 2024 Recruitment",
          "description": "Join our tech club for exciting projects",
          "start_date": "2024-01-01T00:00:00Z",
          "end_date": "2024-01-31T23:59:59Z",
          "status": "published"
        },
        "club": {
          "id": "64f8b2c1e4b0a1234567890d",
          "name": "Tech Innovation Club",
          "description": "A club for technology enthusiasts",
          "logo": "https://example.com/logo.png"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

**Error Responses**:
```json
// 403 Forbidden - Trying to access other user's applications
{
  "success": false,
  "message": "You can only view your own applications"
}

// 404 Not Found - User not found
{
  "success": false,
  "message": "User not found"
}
```



</details>

---

### 3️⃣ Club Member Management

#### Get Club Members

<details>
<summary><strong>GET /api/clubs/:clubId/members</strong> - Get all members of a club</summary>

**Description**: Retrieve all active members of a specific club.

**Access**: Private - Club Members, Organizers, and Managers

**Request**:
```http
GET /api/clubs/64f8b2c1e4b0a1234567890d/members
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clubId | string | Yes | Club ID |

**Response Structure**:
```json
{
  "success": true,
  "message": "Club members retrieved successfully",
  "data": [
    {
      "_id": "64f8b2c1e4b0a1234567890e",
      "user_id": "64f8b2c1e4b0a1234567890a",
      "role": "club_manager",
      "joined_at": "2024-01-01T10:00:00Z"
    },
    {
      "_id": "64f8b2c1e4b0a1234567890f",
      "user_id": "64f8b2c1e4b0a1234567890b",
      "role": "organizer",
      "joined_at": "2024-01-15T14:30:00Z"
    },
    {
      "_id": "64f8b2c1e4b0a123456789010",
      "user_id": "64f8b2c1e4b0a1234567890c",
      "role": "member",
      "joined_at": "2024-02-01T09:15:00Z"
    }
  ]
}
```

**Error Responses**:
```json
// 403 Forbidden - No permission to view members
{
  "success": false,
  "message": "You do not have permission to view club members"
}

// 400 Bad Request - Missing club ID
{
  "success": false,
  "message": "Club ID is required"
}
```



</details>

#### Add Club Member

<details>
<summary><strong>POST /api/clubs/:clubId/members</strong> - Add a member to a club</summary>

**Description**: Add a new member to a club with specified role.

**Access**: Private - Club Manager only

**Request**:
```http
POST /api/clubs/64f8b2c1e4b0a1234567890d/members
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "64f8b2c1e4b0a1234567890a",
  "role": "member"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clubId | string | Yes | Club ID |

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | ID of user to add as member |
| role | string | No | Member role (default: "member") |

**Available Roles**:
- `member`: Basic club member
- `organizer`: Club organizer
- `club_manager`: Club manager (use with caution)

**Response Structure**:
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "_id": "64f8b2c1e4b0a1234567891a",
    "club_id": "64f8b2c1e4b0a1234567890d",
    "user_id": "64f8b2c1e4b0a1234567890a",
    "role": "member",
    "status": "active",
    "approved_by": "64f8b2c1e4b0a1234567890b",
    "approved_at": "2024-01-20T15:30:00Z",
    "joined_at": "2024-01-20T15:30:00Z"
  }
}
```

**Error Responses**:
```json
// 403 Forbidden - No permission to add members
{
  "success": false,
  "message": "You do not have permission to add members to this club"
}

// 409 Conflict - User already a member
{
  "success": false,
  "message": "User is already a member of this club"
}

// 400 Bad Request - Missing required fields
{
  "success": false,
  "message": "Club ID is required"
}
```



</details>

#### Update Member Role

<details>
<summary><strong>PUT /api/clubs/:clubId/members/:userId/role</strong> - Update a member's role in a club</summary>

**Description**: Update the role of an existing club member.

**Access**: Private - Club Manager only

**Request**:
```http
PUT /api/clubs/64f8b2c1e4b0a1234567890d/members/64f8b2c1e4b0a1234567890a/role
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "role": "organizer"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clubId | string | Yes | Club ID |
| userId | string | Yes | User ID of the member |

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | New role for the member |

**Available Roles**:
- `member`: Basic club member
- `organizer`: Club organizer
- `club_manager`: Club manager

**Response Structure**:
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "_id": "64f8b2c1e4b0a1234567891a",
    "club_id": "64f8b2c1e4b0a1234567890d",
    "user_id": "64f8b2c1e4b0a1234567890a",
    "role": "organizer",
    "status": "active",
    "updated_at": "2024-01-20T16:45:00Z",
    "joined_at": "2024-01-01T10:00:00Z"
  }
}
```

**Error Responses**:
```json
// 403 Forbidden - No permission to update roles
{
  "success": false,
  "message": "You do not have permission to update member roles in this club"
}

// 404 Not Found - Member not found
{
  "success": false,
  "message": "Member not found in this club"
}

// 400 Bad Request - Missing required fields
{
  "success": false,
  "message": "Club ID, User ID, and new role are required"
}
```



</details>

#### Remove Club Member

<details>
<summary><strong>DELETE /api/clubs/:clubId/members/:userId</strong> - Remove a member from a club</summary>

**Description**: Remove a member from a club (sets status to 'removed').

**Access**: Private - Club Manager only

**Request**:
```http
DELETE /api/clubs/64f8b2c1e4b0a1234567890d/members/64f8b2c1e4b0a1234567890a
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clubId | string | Yes | Club ID |
| userId | string | Yes | User ID of the member to remove |

**Response Structure**:
```json
{
  "success": true,
  "message": "Member removed successfully",
  "data": {
    "_id": "64f8b2c1e4b0a1234567891a",
    "club_id": "64f8b2c1e4b0a1234567890d",
    "user_id": "64f8b2c1e4b0a1234567890a",
    "role": "member",
    "status": "removed",
    "removed_at": "2024-01-20T17:00:00Z",
    "updated_at": "2024-01-20T17:00:00Z",
    "joined_at": "2024-01-01T10:00:00Z"
  }
}
```

**Error Responses**:
```json
// 403 Forbidden - No permission to remove members
{
  "success": false,
  "message": "You do not have permission to remove members from this club"
}

// 404 Not Found - Member not found
{
  "success": false,
  "message": "Member not found in this club"
}

// 400 Bad Request - Missing required fields
{
  "success": false,
  "message": "Club ID and User ID are required"
}
```



</details>

---

##  Error Handling Best Practices

### Common Error Scenarios

1. **Authentication Errors (401)**
   - Token expired or invalid
   - User not authenticated

2. **Permission Errors (403)**
   - User lacks required role/permission
   - Trying to access other user's data

3. **Validation Errors (400)**
   - Missing required fields
   - Invalid data format

4. **Not Found Errors (404)**
   - Resource doesn't exist
   - Member not found in club

5. **Conflict Errors (409)**
   - User already a member
   - Duplicate operations

### Frontend Error Handling Template

All endpoints follow consistent error response format. Handle errors based on HTTP status codes:

- **401 Unauthorized**: Token expired or invalid - redirect to login
- **403 Forbidden**: User lacks required permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate operations (e.g., user already a member)
- **400 Bad Request**: Missing required fields or invalid data format

---

## 📝 Notes for Frontend Developers

1. **Authentication**: Most endpoints require JWT authentication via API Gateway headers
2. **Public Endpoints**: Club details endpoint (`GET /api/clubs/:id`) uses API Gateway secret validation only
3. **Permission Checks**: Implement role-based UI access control
4. **Error Handling**: All endpoints return consistent error response format
5. **Pagination**: User applications endpoint supports pagination
6. **Data Consistency**: Club member operations should refresh member lists
7. **Status Management**: Member removal sets status to 'removed' rather than hard delete
