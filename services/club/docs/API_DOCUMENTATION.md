# Club Service API Documentation

## Overview

The Club Service provides APIs for managing clubs, including creation, listing, and retrieving club recruitment rounds. This documentation describes only the implemented endpoints ready for frontend integration.

## Base URL

```
/api
```

## Authentication

Authentication is handled by the API Gateway. The following headers are passed to the service:

- `x-user-id`: The ID of the authenticated user
- `x-user-email`: The email of the authenticated user
- `x-user-full-name`: The full name of the authenticated user
- `x-user-roles`: Comma-separated list of user roles
- `x-user-email-verified`: Boolean indicating if the user's email is verified

## Error Handling

All endpoints may return these error responses:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input parameters |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | CLUB_NOT_FOUND | Club not found |
| 409 | DUPLICATE_ENTITY | Duplicate club name |
| 500 | INTERNAL_SERVER_ERROR | Server error |

Error response format:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Name and type are required"
}
```

## Implemented Endpoints

### 1. List All Clubs

```
GET /api/clubs
```

Returns a paginated list of clubs with filtering options.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Filter by club name (case-insensitive) |
| type | string | No | Filter by club type (ACADEMIC, SPORTS, etc.) |
| status | string | No | Filter by status (ACTIVE, INACTIVE) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Results per page (default: 10) |

**Response:** (200 OK)

```json
{
  "total": 2,
  "results": [
    {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Science Club",
      "type": "ACADEMIC",
      "status": "ACTIVE",
      "logo_url": "https://example.com/logo.png"
    },
    {
      "id": "60d0fe4f5311236168a109cb",
      "name": "Sports Club",
      "type": "SPORTS",
      "status": "ACTIVE",
      "logo_url": "https://example.com/sports-logo.png"
    }
  ]
}
```

### 2. Get Club Details

```
GET /api/clubs/{id}
```

Returns detailed information about a specific club.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ID of the club |

**Response:** (200 OK)

```json
{
  "id": "60d0fe4f5311236168a109ca",
  "name": "Science Club",
  "description": "A club for science enthusiasts",
  "type": "ACADEMIC",
  "size": 25,
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://scienceclub.example.com",
  "status": "ACTIVE"
}
```

**Error Response:** (404 Not Found)

```json
{
  "status": 404,
  "error": "CLUB_NOT_FOUND",
  "message": "Club not found"
}
```

### 3. Create New Club

```
POST /api/clubs
```

Creates a new club in the system.

**Authentication Required:** Yes  
**Authorization:** Requires `SYSTEM_ADMIN` role

**Request Headers:**
- `x-user-id`: User ID of the creator (sent automatically by API Gateway)
- `x-user-roles`: Must include "SYSTEM_ADMIN" (sent automatically by API Gateway)

**Request Body:**

```json
{
  "name": "Arts Club",           // Required
  "description": "A club for creative arts enthusiasts",
  "type": "CULTURAL",            // Required
  "logo_url": "https://example.com/arts-logo.png",
  "website_url": "https://artsclub.example.com"
}
```

**Response:** (201 Created)

```json
{
  "id": "60d0fe4f5311236168a109cc",
  "name": "Arts Club",
  "description": "A club for creative arts enthusiasts",
  "type": "CULTURAL",
  "status": "ACTIVE",
  "logo_url": "https://example.com/arts-logo.png",
  "website_url": "https://artsclub.example.com",
  "created_by": "60d0fe4f5311236168a109ca"
}
```

**Error Responses:**

- 400 Bad Request: Missing required fields
```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Name and type are required"
}
```

- 409 Conflict: Duplicate club name
```json
{
  "status": 409,
  "error": "DUPLICATE_ENTITY",
  "message": "A club with this name already exists",
  "field": "name"
}
```

### 4. Get Club Recruitments

```
GET /api/clubs/{id}/recruitments
```

Returns all recruitment rounds for a specific club.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ID of the club |

**Response:** (200 OK)

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

**Error Response:** (404 Not Found)

```json
{
  "status": 404,
  "error": "CLUB_NOT_FOUND",
  "message": "Club not found"
}
```

## Data Models

### Club

| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Unique identifier |
| name | String | Club name (unique) |
| description | String | Club description |
| type | String | Club type (ACADEMIC, SPORTS, CULTURAL, etc.) |
| size | Number | Number of members |
| logo_url | String | URL to club logo |
| website_url | String | URL to club website |
| status | String | Status (ACTIVE, INACTIVE) |
| created_by | ObjectId | Creator's user ID |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |

### RecruitmentRound

| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Unique identifier |
| club_id | ObjectId | Associated club ID |
| title | String | Recruitment title |
| start_at | Date | Start date |
| status | String | Status (OPEN, CLOSED, CANCELLED) |

## Sample API Requests

### Using Fetch API (JavaScript)

```javascript
// List all clubs
async function getClubs() {
  const response = await fetch('http://localhost:3002/api/clubs');
  const data = await response.json();
  return data;
}

// Get club details
async function getClubDetails(clubId) {
  const response = await fetch(`http://localhost:3002/api/clubs/${clubId}`);
  const data = await response.json();
  return data;
}

// Create a new club
async function createClub(clubData) {
  const response = await fetch('http://localhost:3002/api/clubs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // These headers will be set by API Gateway in production
      'x-user-id': 'currentUserId',
      'x-user-roles': 'SYSTEM_ADMIN'
    },
    body: JSON.stringify(clubData)
  });
  const data = await response.json();
  return data;
}

// Get club recruitments
async function getClubRecruitments(clubId) {
  const response = await fetch(`http://localhost:3002/api/clubs/${clubId}/recruitments`);
  const data = await response.json();
  return data;
}
```

### Using Axios (JavaScript)

```javascript
import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:3002/api';

// List all clubs with filters
async function getClubs(filters = {}) {
  const response = await axios.get(`${API_BASE_URL}/clubs`, { params: filters });
  return response.data;
}

// Get club details
async function getClubById(clubId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/clubs/${clubId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Club not found');
    }
    throw error;
  }
}

// Create a new club
async function createClub(clubData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/clubs`, clubData, {
      headers: {
        // These headers will be set by API Gateway in production
        'x-user-id': 'currentUserId',
        'x-user-roles': 'SYSTEM_ADMIN'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error('A club with this name already exists');
    }
    throw error;
  }
}

// Get club recruitments
async function getClubRecruitments(clubId) {
  const response = await axios.get(`${API_BASE_URL}/clubs/${clubId}/recruitments`);
  return response.data;
}
```

## Contact

For questions or support regarding the Club Service API, please contact the backend team at backend@clubmanagementsystem.example.com.
