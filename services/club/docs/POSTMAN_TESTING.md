# Club Service Testing Guide

This document provides instructions for testing the Club Service API endpoints using Postman.

## Prerequisites

1. MongoDB installed and running (or set MOCK_DB=true in .env file)
2. Node.js and npm installed
3. Postman installed

## Setup Steps

1. Install dependencies:
   ```
   cd services/club
   npm install
   ```

2. Configure environment:
   - Copy .env.example to .env if not already done
   - Set MONGO_URI if needed (default: mongodb://localhost:27017/club_service)
   - Set MOCK_DB=true if MongoDB is not available (for limited functionality)

3. Seed test data (optional but recommended):
   ```
   node scripts/seed-test-data.js
   ```
   This will create sample clubs and recruitment rounds for testing.
   Note the club IDs printed in the console for use in your Postman requests.

4. Start the server:
   ```
   npm start
   ```
   The server will start on port 3002 by default.

## Using the Postman Collection

1. Import the Postman collection:
   - Open Postman
   - Click Import > Upload Files
   - Select `club-service-postman.json` from project root
   - Click Import

2. Configure variables:
   - In the imported collection, click the Variables tab
   - Set the `club_id` variable to one of the IDs printed by the seed script
   - If testing authenticated endpoints, set the `auth_token` variable to a valid JWT

3. Test the endpoints:
   - Health Check: Basic health check endpoint
   - Filter/Search Clubs: Test filtering by name, type, status with pagination
   - Get Club Details: View club information (requires valid club_id)
   - Get Club Recruitments: View recruitment rounds for a club (requires valid club_id)
   - Create Club: Test creating a new club

## Available Endpoints

| Endpoint | Method | Description | Query Parameters | Auth Required |
|----------|--------|-------------|-----------------|--------------|
| /health | GET | Health check | None | No |
| /api/clubs | GET | Filter/search clubs | name, type, status, page, limit | No |
| /api/clubs/:id | GET | Get club details | None | No |
| /api/clubs/:id/recruitments | GET | Get club recruitments | None | No |
| /api/clubs | POST | Create new club | None | Yes* |

*Note: Authentication is currently commented out in the code for ease of testing

## Troubleshooting

1. **Connection errors**: 
   - Check if MongoDB is running
   - Verify MONGO_URI is correct
   - Try setting MOCK_DB=true for development

2. **404 errors on club endpoints**:
   - Make sure you're using a valid club_id
   - Run the seed script to create test data

3. **API response format issues**:
   - Check the terminal for error logs
   - Make sure the service is running without errors
