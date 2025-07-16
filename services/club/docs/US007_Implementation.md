# US007 Implementation: Filter/Search Clubs

## Overview
This implements **US007 - Filter/Search Clubs** functionality allowing users to search for clubs that match their interests with advanced filtering and sorting capabilities.

## 🎯 User Story
**As a user, I want to filter or search for clubs so that I can find clubs that match my interests.**

## ✅ Acceptance Criteria
- [x] User can search by club name, category, or location
- [x] System displays filtered results with basic club details
- [x] Results are sortable by relevance or name
- [x] Additional sorting options (newest, oldest, category, location)
- [x] Pagination support for large result sets
- [x] Helper endpoints for available categories and locations

## 📋 API Endpoints

### Main Search Endpoint
```
GET /api/clubs
```

#### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search across name, description, category, location | `?search=Computer Science` |
| `name` | string | Filter by club name (partial match) | `?name=Basketball` |
| `category` | string | Filter by category (exact match) | `?category=technology` |
| `location` | string | Filter by location (partial match) | `?location=Engineering` |
| `sort` | string | Sort results | `?sort=name` |
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |

#### Sort Options
- `name` - Sort by name (A-Z)
- `name_desc` - Sort by name (Z-A)
- `category` - Sort by category, then name
- `location` - Sort by location, then name
- `newest` - Sort by creation date (newest first)
- `oldest` - Sort by creation date (oldest first)
- `relevance` - Sort by search relevance (default for searches)

### Helper Endpoints

#### Get Available Categories
```
GET /api/clubs/categories
```
Returns: `["academic", "arts", "cultural", "social", "sports", "technology", "volunteer"]`

#### Get Available Locations
```
GET /api/clubs/locations
```
Returns: `["Engineering Building, Room 101", "Sports Complex, Court 1", ...]`

#### Get Club Statistics
```
GET /api/clubs/stats
```
Returns: 
```json
{
  "totalClubs": 8,
  "categories": ["academic", "arts", "cultural", "social", "sports", "technology", "volunteer"],
  "locations": ["Engineering Building, Room 101", "Sports Complex, Court 1", ...],
  "averageSize": 37.125
}
```

## 🔍 Search Examples

### Basic Search
```bash
# Search for "Computer Science"
curl -X GET "http://localhost:8000/api/clubs?search=Computer Science" \
  -H "X-API-Gateway-Secret: your-secret-key"

# Filter by technology category
curl -X GET "http://localhost:8000/api/clubs?category=technology" \
  -H "X-API-Gateway-Secret: your-secret-key"

# Filter by location
curl -X GET "http://localhost:8000/api/clubs?location=Engineering" \
  -H "X-API-Gateway-Secret: your-secret-key"
```

### Advanced Search with Sorting
```bash
# Search with sorting and pagination
curl -X GET "http://localhost:8000/api/clubs?search=club&sort=relevance&page=1&limit=5" \
  -H "X-API-Gateway-Secret: your-secret-key"

# Filter arts clubs sorted by name
curl -X GET "http://localhost:8000/api/clubs?category=arts&sort=name" \
  -H "X-API-Gateway-Secret: your-secret-key"
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Clubs retrieved successfully",
  "data": {
    "total": 8,
    "page": 1,
    "totalPages": 1,
    "limit": 10,
    "results": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Computer Science Club",
        "description": "A club for computer science students...",
        "category": "technology",
        "location": "Engineering Building, Room 101",
        "logo_url": "https://example.com/cs-club-logo.png",
        "status": "active",
        "member_count": 45,
        "created_at": "2024-01-15T00:00:00.000Z",
        "relevance_score": 0.95
      }
    ]
  },
  "meta": {
    "searchParams": {
      "search": "Computer Science",
      "sort": "relevance",
      "page": 1,
      "limit": 10
    },
    "timestamp": "2025-07-16T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid category. Must be one of: academic, sports, arts, technology, social, volunteer, cultural, other",
  "code": "VALIDATION_ERROR"
}
```

## 🛠️ Implementation Details

### Database Indexes
The following MongoDB indexes are created for optimal search performance:
- **Text Index**: `name`, `description`, `category`, `location`
- **Individual Indexes**: `category`, `location`, `status`, `created_at`, `deleted_at`

### Search Logic
1. **Full-text Search**: When `search` parameter is provided, searches across multiple fields
2. **Field-specific Filters**: Individual parameters for precise filtering
3. **Relevance Scoring**: MongoDB text search provides relevance scores
4. **Pagination**: Efficient skip/limit implementation
5. **Security**: Input sanitization and validation

### Middleware
- **Public Routes**: Only require API Gateway secret validation
- **Input Validation**: Category and sort parameter validation
- **Sanitization**: XSS prevention on search inputs

## 🧪 Testing

### Run Test Suite
```bash
# Seed sample data
node services/club/src/scripts/seedClubs.js

# Run comprehensive tests
node services/club/src/scripts/testUS007.js
```

### Test Coverage
- [x] Basic search functionality
- [x] Category filtering
- [x] Location filtering
- [x] All sorting options
- [x] Combined filters
- [x] Pagination
- [x] Helper endpoints
- [x] Edge cases and error handling

## 🏗️ Architecture

```
Kong API Gateway
    ↓
Club Service Routes
    ↓
AuthMiddleware (validateApiGatewaySecret)
    ↓
Club Controller (getClubs)
    ↓
Club Model (findAll with search logic)
    ↓
MongoDB with Search Indexes
```

## 📈 Performance Considerations

1. **Database Indexes**: Optimized for common search patterns
2. **Pagination**: Prevents large result sets
3. **Query Optimization**: Efficient MongoDB aggregation
4. **Caching**: Ready for Redis implementation
5. **Rate Limiting**: Handled by API Gateway

## 🔒 Security

- **Input Sanitization**: Prevents XSS attacks
- **Parameter Validation**: Prevents invalid queries
- **Access Control**: Public endpoints with gateway validation
- **Query Injection**: MongoDB parameterized queries

## 📋 Future Enhancements

- [ ] Elasticsearch integration for advanced search
- [ ] Geolocation-based search
- [ ] Fuzzy matching for typos
- [ ] Search suggestions/autocomplete
- [ ] Advanced faceted search
- [ ] Search analytics and recommendations

## 🐛 Known Limitations

1. Text search requires exact word matching (no fuzzy search)
2. Location search is basic string matching (no geocoding)
3. No search result caching yet
4. Limited to 100 results per page

## 📝 Related User Stories

- **US008**: View Club Information (enhanced with search context)
- **US009**: Create Recruitment Campaign (can leverage search categories)
- **US011**: Apply to Join Club (users find clubs via search)

This implementation provides a robust foundation for club discovery that can be extended with more advanced search features as needed.
